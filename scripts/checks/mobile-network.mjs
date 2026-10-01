#!/usr/bin/env node
/**
 * Enforces the "mobile talks to the API through the central client" rule:
 *  - no raw `fetch(` / `XMLHttpRequest` in app code (only packages/api-client may call the network)
 *  - no hardcoded http(s) URLs outside the single environment config file
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const scanDirs = ['apps/mobile/app', 'apps/mobile/src'];
const urlAllowedIn = new Set(['apps/mobile/src/shared/config/env.ts']);
const skipFile = /\.(test|spec)\.[tj]sx?$/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== 'node_modules') yield* walk(full);
    } else if (/\.[tj]sx?$/.test(entry) && !skipFile.test(entry)) {
      yield full;
    }
  }
}

const violations = [];
for (const dir of scanDirs) {
  for (const file of walk(join(root, dir))) {
    const rel = relative(root, file).split(sep).join('/');
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const code = line.replace(/\/\/.*$/, '');
        if (/\b(fetch\s*\(|XMLHttpRequest)/.test(code)) {
          violations.push(`${rel}:${index + 1} raw network call; use the central API client`);
        }
        if (/https?:\/\//.test(code) && !urlAllowedIn.has(rel)) {
          violations.push(`${rel}:${index + 1} hardcoded URL; read it from shared/config/env.ts`);
        }
      });
  }
}

if (violations.length > 0) {
  console.error(`Mobile network rule violations:\n${violations.map((v) => `  ${v}`).join('\n')}`);
  process.exit(1);
}
console.log('mobile network check passed');
