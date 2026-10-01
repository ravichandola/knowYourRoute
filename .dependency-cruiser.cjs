/**
 * Architecture rules. These are the executable version of docs/architecture/ARCHITECTURE.md:
 * when someone adds a dependency that breaks the intended communication paths, CI fails.
 *
 *   pnpm arch:check   -> validate rules
 *   pnpm arch:docs    -> regenerate docs/architecture/generated/*
 */

const API = '^apps/api/src';
const MODULES = `${API}/modules`;
const MOBILE = '^apps/mobile';
const FEATURES = `${MOBILE}/src/features`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies hide the real direction of communication.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'prod-code-must-not-import-tests',
      severity: 'error',
      comment: 'Tests may import production code, never the other way around.',
      from: { pathNot: '(\\.spec\\.ts$|\\.test\\.tsx?$|/__tests__/|/test/)' },
      to: { path: '(\\.spec\\.ts$|\\.test\\.tsx?$|/__tests__/)' },
    },

    // ---------------------------------------------------------------- API
    {
      name: 'api-modules-talk-via-public-api',
      severity: 'error',
      comment:
        'A module may use another module only through its index.ts (public API). ' +
        'Reaching into services/repositories of another module is forbidden.',
      from: { path: `${MODULES}/([^/]+)/` },
      to: {
        path: `${MODULES}/[^/]+/`,
        pathNot: [`${MODULES}/$1/`, `${MODULES}/[^/]+/index\\.ts$`],
      },
    },
    {
      name: 'api-domain-is-pure',
      severity: 'error',
      comment:
        'domain/ holds business rules and ports. It may use only its own folder, shared contracts ' +
        'and zod: no Nest, no Prisma, no other layer, no other module, no platform.',
      from: { path: `${MODULES}/[^/]+/domain/`, pathNot: '\\.spec\\.ts$' },
      to: {
        pathNot: [
          `${MODULES}/[^/]+/domain/`,
          '^packages/contracts/',
          'node_modules/@know-your-route/contracts/',
          'node_modules/zod/',
        ],
      },
    },
    {
      name: 'api-application-only-uses-domain',
      severity: 'error',
      comment:
        'application/ orchestrates use cases against ports. It must not know adapters (infrastructure), ' +
        'HTTP or platform plumbing; those are wired in the *.module.ts. (platform/demo seed constants are allowed.)',
      from: { path: `${MODULES}/[^/]+/application/`, pathNot: '\\.spec\\.ts$' },
      to: {
        path: [`${MODULES}/[^/]+/(infrastructure|http)/`, `${API}/platform/`],
        pathNot: `${API}/platform/demo/`,
      },
    },
    {
      name: 'api-application-never-calls-other-modules',
      severity: 'error',
      comment:
        'A use case reaches another module only through a port declared in its own domain/; ' +
        'the adapter behind that port (infrastructure/) is the only place that imports the other module.',
      from: { path: `${MODULES}/([^/]+)/(application|domain)/`, pathNot: '\\.spec\\.ts$' },
      to: { path: `${MODULES}/[^/]+/`, pathNot: `${MODULES}/$1/` },
    },
    {
      name: 'api-http-must-not-touch-infrastructure',
      severity: 'error',
      comment: 'Controllers call application services; they never talk to adapters directly.',
      from: { path: `${MODULES}/[^/]+/http/`, pathNot: '\\.spec\\.ts$' },
      to: { path: `${MODULES}/[^/]+/infrastructure/` },
    },
    {
      name: 'api-infrastructure-must-not-reach-up',
      severity: 'error',
      comment: 'Adapters implement ports; they never call controllers or use cases.',
      from: { path: `${MODULES}/[^/]+/infrastructure/` },
      to: { path: `${MODULES}/[^/]+/(http|application)/` },
    },
    {
      name: 'api-platform-is-below-modules',
      severity: 'error',
      comment: 'platform/ is shared technical plumbing and must not know any business module.',
      from: { path: `${API}/platform/` },
      to: { path: [`${MODULES}/`, `${API}/app\\.module\\.ts$`] },
    },
    {
      name: 'api-only-composition-root-imports-app-module',
      severity: 'error',
      from: { path: `${MODULES}/` },
      to: { path: `${API}/app\\.module\\.ts$` },
    },

    // ------------------------------------------------------------- Mobile
    {
      name: 'mobile-features-talk-via-public-api',
      severity: 'error',
      comment: 'A feature may use another feature only through its index.ts.',
      from: { path: `${FEATURES}/([^/]+)/` },
      to: {
        path: `${FEATURES}/[^/]+/`,
        pathNot: [`${FEATURES}/$1/`, `${FEATURES}/[^/]+/index\\.ts$`],
      },
    },
    {
      name: 'mobile-shared-is-below-features',
      severity: 'error',
      comment: 'shared/ is reusable plumbing and must not depend on any feature, route or the app shell.',
      from: { path: `${MOBILE}/src/shared/` },
      to: { path: [`${FEATURES}/`, `${MOBILE}/src/app-shell/`, `${MOBILE}/app/`] },
    },
    {
      name: 'mobile-features-must-not-reach-routes-or-shell',
      severity: 'error',
      from: { path: `${FEATURES}/` },
      to: { path: [`${MOBILE}/app/`, `${MOBILE}/src/app-shell/`] },
    },
    {
      name: 'mobile-routes-use-feature-public-api',
      severity: 'error',
      comment: 'Route files are thin: they re-export a screen from a feature index.',
      from: { path: `${MOBILE}/app/` },
      to: { path: `${FEATURES}/`, pathNot: `${FEATURES}/[^/]+/index\\.ts$` },
    },
    {
      name: 'mobile-backend-calls-only-through-shared-api',
      severity: 'error',
      comment: 'Only shared/api talks to the SDK package, so every backend call has one entry point.',
      from: { path: [`${FEATURES}/`, `${MOBILE}/src/app-shell/`, `${MOBILE}/app/`] },
      to: { path: '^packages/api-client/' },
    },

    // ----------------------------------------------------------- Packages
    {
      name: 'contracts-depends-on-nothing-internal',
      severity: 'error',
      comment: 'contracts is the bottom of the graph: no apps, no other workspace package.',
      from: { path: '^packages/contracts/src' },
      to: { path: ['^apps/', '^packages/(api-client|ui|config)/'] },
    },
    {
      name: 'api-client-depends-only-on-contracts',
      severity: 'error',
      from: { path: '^packages/api-client/src' },
      to: { path: ['^apps/', '^packages/(ui|config)/'] },
    },
    {
      name: 'apps-are-isolated',
      severity: 'error',
      comment: 'API and mobile only share code through packages/.',
      from: { path: '^apps/api/' },
      to: { path: ['^apps/mobile/', '^packages/(api-client|ui)/'] },
    },
    {
      name: 'mobile-must-not-import-api',
      severity: 'error',
      from: { path: '^apps/mobile/' },
      to: { path: '^apps/api/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: ['\\.d\\.ts$', '/dist/', '/\\.expo/'] },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['types', 'main'],
    },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
    },
  },
};
