#!/usr/bin/env node
/**
 * Generates the architecture maps from the real code (never edited by hand):
 *
 *   docs/architecture/generated/module-map.md  who depends on whom (backend modules, mobile features, packages)
 *   docs/architecture/generated/api-map.md     endpoint -> backend handler -> mobile callers
 *
 * Usage:
 *   node scripts/architecture/generate.mjs            write the files
 *   node scripts/architecture/generate.mjs --check    fail if an endpoint has no backend handler / is unused
 *                                                     (CI additionally runs `git diff --exit-code docs/`)
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = join(ROOT, 'docs/architecture/generated');
const CHECK = process.argv.includes('--check');

const rel = (p) => relative(ROOT, p).split('\\').join('/');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.expo') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.spec\.|\.test\./.test(name)) out.push(full);
  }
  return out;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/* ---------------------------------------------------------------- module map */

function cruise() {
  const raw = execFileSync(
    'npx',
    [
      'depcruise',
      'apps/api/src',
      'apps/mobile/app',
      'apps/mobile/src',
      'packages/contracts/src',
      'packages/api-client/src',
      '--config',
      '.dependency-cruiser.cjs',
      '--ts-config',
      'tsconfig.arch.json',
      '--output-type',
      'json',
    ],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
  );
  return JSON.parse(raw).modules;
}

function unitOf(path) {
  let m = path.match(/^apps\/api\/src\/modules\/([^/]+)\//);
  if (m) return { kind: 'api-module', id: `api_${m[1].replace(/-/g, '_')}`, label: m[1] };
  m = path.match(/^apps\/api\/src\/platform\/([^/]+)\//);
  if (m) return { kind: 'api-platform', id: 'api_platform', label: 'platform' };
  m = path.match(/^apps\/mobile\/src\/features\/([^/]+)\//);
  if (m) return { kind: 'mobile-feature', id: `mobile_${m[1].replace(/-/g, '_')}`, label: m[1] };
  if (/^apps\/mobile\/src\/shared\//.test(path)) return { kind: 'mobile-shared', id: 'mobile_shared', label: 'shared' };
  if (/^apps\/mobile\/src\/app-shell\//.test(path)) return { kind: 'mobile-shell', id: 'mobile_shell', label: 'app-shell' };
  if (/^apps\/mobile\/app\//.test(path)) return { kind: 'mobile-routes', id: 'mobile_routes', label: 'app/ (routes)' };
  if (/^packages\/contracts\//.test(path)) return { kind: 'package', id: 'pkg_contracts', label: 'contracts' };
  if (/^packages\/api-client\//.test(path)) return { kind: 'package', id: 'pkg_api_client', label: 'api-client' };
  return null;
}

function buildEdges(modules) {
  const edges = new Map();
  for (const mod of modules) {
    if (/\.(spec|test)\./.test(mod.source)) continue;
    const from = unitOf(mod.source);
    if (!from) continue;
    for (const dep of mod.dependencies) {
      if (!dep.resolved || dep.coreModule) continue;
      const to = unitOf(dep.resolved);
      if (!to || to.id === from.id) continue;
      const key = `${from.id}->${to.id}`;
      const edge = edges.get(key) ?? { from, to, via: new Set() };
      edge.via.add(mod.source);
      edges.set(key, edge);
    }
  }
  return [...edges.values()];
}

function mermaidFor(edges, units, direction = 'LR') {
  const nodes = new Map();
  for (const e of edges) {
    if (units.has(e.from.kind)) nodes.set(e.from.id, e.from);
    if (units.has(e.to.kind)) nodes.set(e.to.id, e.to);
  }
  const lines = [`flowchart ${direction}`];
  for (const n of nodes.values()) lines.push(`  ${n.id}["${n.label}"]`);
  for (const e of edges) {
    if (units.has(e.from.kind) && units.has(e.to.kind)) lines.push(`  ${e.from.id} --> ${e.to.id}`);
  }
  return lines.join('\n');
}


function coarseMermaid(edges) {
  const coarse = (u) => {
    if (u.kind === 'api-module') return { id: 'api_modules', label: 'apps/api modules' };
    if (u.kind === 'api-platform') return { id: 'api_platform', label: 'apps/api platform' };
    if (u.kind === 'mobile-feature') return { id: 'mobile_features', label: 'apps/mobile features' };
    return u;
  };
  const seen = new Set();
  const nodes = new Map();
  for (const e of edges) {
    const a = coarse(e.from);
    const b = coarse(e.to);
    if (a.id === b.id) continue;
    nodes.set(a.id, a);
    nodes.set(b.id, b);
    seen.add(`  ${a.id} --> ${b.id}`);
  }
  return [
    'flowchart TB',
    ...[...nodes.values()].map((n) => `  ${n.id}["${n.label}"]`),
    ...[...seen].sort(),
  ].join('\n');
}

function viaTable(edges, fromKinds, toKinds) {
  const rows = [];
  for (const e of edges) {
    if (!fromKinds.has(e.from.kind) || !toKinds.has(e.to.kind)) continue;
    const files = [...e.via]
      .map((f) => `\`${f.replace(/^apps\/(api|mobile)\/(src\/)?/, '')}\``)
      .sort()
      .join('<br>');
    rows.push(`| ${e.from.label} | ${e.to.label} | ${files} |`);
  }
  rows.sort();
  return ['| From | Calls | Through (file that imports it) |', '| --- | --- | --- |', ...rows].join('\n');
}

function writeModuleMap(edges) {
  const apiKinds = new Set(['api-module']);
  const apiWithPlatform = new Set(['api-module', 'api-platform']);
  const mobileKinds = new Set(['mobile-feature']);
  const md = `<!-- GENERATED by scripts/architecture/generate.mjs - do not edit. Run \`pnpm arch:docs\`. -->

# Module map

Generated from the real import graph (dependency-cruiser). The rules that keep this graph honest live in
\`.dependency-cruiser.cjs\` and run in CI via \`pnpm arch:check\`.

## Backend modules (apps/api)

An arrow means "module A imports module B's public API (\`index.ts\`)". Only \`infrastructure/\` adapters and the
\`*.module.ts\` files are allowed to create such an arrow; use cases only see ports from their own \`domain/\`.

\`\`\`mermaid
${mermaidFor(edges, apiKinds)}
\`\`\`

Which file creates each arrow:

${viaTable(edges, apiKinds, apiKinds)}

### Backend modules -> platform (shared technical plumbing)

${viaTable(edges, apiKinds, new Set(['api-platform']))}

## Mobile features (apps/mobile)

An arrow means "feature A imports feature B's public API (\`index.ts\`)".

\`\`\`mermaid
${mermaidFor(edges, mobileKinds)}
\`\`\`

${viaTable(edges, mobileKinds, mobileKinds)}

## Across the monorepo

Feature/module internals collapsed; this is the "who talks to whom between apps and packages" view.

\`\`\`mermaid
${coarseMermaid(edges)}
\`\`\`
`;
  writeFileSync(join(OUT_DIR, 'module-map.md'), md);
}

/* ------------------------------------------------------------------- API map */

function readContracts() {
  const entry = join(ROOT, 'packages/contracts/dist/index.js');
  let contracts;
  try {
    contracts = createRequire(import.meta.url)(entry);
  } catch {
    console.error('packages/contracts is not built. Run `pnpm --filter @know-your-route/contracts build` first.');
    process.exit(1);
  }
  const endpoints = [];
  for (const [exportName, value] of Object.entries(contracts)) {
    if (!exportName.endsWith('Contract') || typeof value !== 'object') continue;
    const contract = exportName.slice(0, -'Contract'.length);
    for (const [name, ep] of Object.entries(value)) {
      if (ep && typeof ep === 'object' && typeof ep.method === 'string' && typeof ep.fullPath === 'string') {
        endpoints.push({ contract, name, method: ep.method, path: ep.fullPath });
      }
    }
  }
  return endpoints;
}

function findHandlers() {
  const handlers = [];
  for (const file of walk(join(ROOT, 'apps/api/src'))) {
    if (!file.endsWith('.controller.ts')) continue;
    const text = readFileSync(file, 'utf8');
    const re = /@(Get|Post|Put|Patch|Delete)\((\w+)Contract\.(\w+)\.path\)\s*(?:@\w+\([^)]*\)\s*)*(?:async\s+)?(\w+)\(/g;
    let m;
    while ((m = re.exec(text))) {
      handlers.push({
        contract: m[2],
        name: m[3],
        handler: `${rel(file)}:${lineOf(text, m.index)} \`${m[4]}\``,
      });
    }
  }
  return handlers;
}

function findCallers() {
  const callers = [];
  const dirs = [join(ROOT, 'apps/mobile/src'), join(ROOT, 'apps/mobile/app')];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      const text = readFileSync(file, 'utf8');
      const re = /\bapi\.(\w+)\.(\w+)\(/g;
      let m;
      while ((m = re.exec(text))) {
        callers.push({ contract: m[1], name: m[2], at: `${rel(file)}:${lineOf(text, m.index)}` });
      }
    }
  }
  return callers;
}

function writeApiMap() {
  const endpoints = readContracts();
  const handlers = findHandlers();
  const callers = findCallers();
  const problems = [];

  const rows = endpoints.map((ep) => {
    const handler = handlers.find((h) => h.contract === ep.contract && h.name === ep.name);
    const used = callers.filter((c) => c.contract === ep.contract && c.name === ep.name);
    if (!handler) problems.push(`No backend handler binds ${ep.contract}.${ep.name} (${ep.method} ${ep.path})`);
    return { ep, handler, used };
  });

  const table = rows
    .map(({ ep, handler, used }) => {
      const callerCell = used.length
        ? used.map((u) => `\`${u.at.replace('apps/mobile/', '')}\``).join('<br>')
        : '_not used by mobile yet_';
      return `| \`${ep.method}\` \`${ep.path}\` | \`${ep.contract}.${ep.name}\` | ${handler ? handler.handler.replace('apps/api/src/', '') : '**missing**'} | ${callerCell} |`;
    })
    .join('\n');

  const md = `<!-- GENERATED by scripts/architecture/generate.mjs - do not edit. Run \`pnpm arch:docs\`. -->

# API call map

How every backend call flows, derived from the contracts, the controllers and the mobile call sites:

\`\`\`mermaid
flowchart LR
  screen["Screen / hook<br>(mobile feature)"] -->|"api.&lt;contract&gt;.&lt;endpoint&gt;()"| sdk["typed SDK<br>(packages/api-client)"]
  sdk -->|"HTTP using the path in the contract"| ctrl["Controller<br>(modules/*/http)"]
  ctrl -->|"zod pipe validates body/query"| uc["Service / use case<br>(modules/*/application)"]
  uc -->|"calls a port"| adapter["Adapter<br>(modules/*/infrastructure)"]
  contracts[("packages/contracts<br>paths + zod schemas + types")] -.-> sdk
  contracts -.-> ctrl
\`\`\`

| HTTP | Contract entry | Backend handler (controller) | Called from (mobile) |
| --- | --- | --- | --- |
${table}

Contracts live in \`packages/contracts/src/*/contract.ts\`. Changing a path, body or response there changes the
server decorators and the SDK call signature at the same time, and the compiler points at every caller.
`;
  writeFileSync(join(OUT_DIR, 'api-map.md'), md);
  return problems;
}

/* ---------------------------------------------------------------------- main */

mkdirSync(OUT_DIR, { recursive: true });
writeModuleMap(buildEdges(cruise()));
const problems = writeApiMap();

if (problems.length) {
  console.error(`${CHECK ? 'ERROR' : 'WARN'}: API map inconsistencies:\n  - ${problems.join('\n  - ')}`);
  if (CHECK) process.exit(1);
}
console.log('architecture docs generated in docs/architecture/generated');
