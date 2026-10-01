# Know Your Route

Route, vehicle and trip-safety intelligence. A React Native (Expo) app on top of a modular NestJS backend, in one
pnpm + Turborepo monorepo.

## Where to look

| I want to know... | Read |
| --- | --- |
| How the pieces fit and the rules between them | [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md) |
| Which module/feature depends on which (always current) | [`docs/architecture/generated/module-map.md`](./docs/architecture/generated/module-map.md) |
| Which screen calls which endpoint, and which controller answers | [`docs/architecture/generated/api-map.md`](./docs/architecture/generated/api-map.md) |

## Repository layout

```text
apps/
  api/        NestJS modular monolith: src/modules/{identity,vehicles,fastag,route-planning,trips} + src/platform
  mobile/     Expo app: app/ (routes) + src/features/* + src/shared + src/app-shell
packages/
  contracts/  endpoint definitions, zod schemas, shared types (the only thing api and mobile share)
  api-client/ typed SDK: api.<contract>.<endpoint>(...)
  ui/         design tokens
  config/     shared tsconfig / lint config
docs/architecture/   architecture guide + generated maps
scripts/architecture/ generator for the maps
```

## Quick start

Requirements: Node >= 20, pnpm (version pinned in `package.json`).

```bash
pnpm install
cp .env.example .env.development   # if you do not have one yet
pnpm dev:api                       # http://localhost:4000/api/v1  (Swagger: /api/docs)
pnpm dev:mobile                    # Expo: i = iOS, a = Android, w = web
```

`pnpm dev` runs both. Packages are built automatically before `dev`, `typecheck`, `test` and `build` (Turborepo).

The login screen has a demo sign-in; the demo user, vehicle and FASTag exist when `PERSISTENCE_DRIVER=memory`.

## Configuration switches

Chosen once at boot; unknown values stop the server with a clear error (no silent fallback).

```bash
PERSISTENCE_DRIVER=memory   # memory | prisma (prisma needs DATABASE_URL)
MAP_PROVIDER=mock
WEATHER_PROVIDER=mock
VEHICLE_PROVIDER=mock
FASTAG_PROVIDER=mock
AI_PROVIDER=mock
JWT_SECRET=...              # required when NODE_ENV=production
```

Adding a real provider means implementing the module's port in `infrastructure/` and registering it in that
module's `*.module.ts` (see the architecture guide).

## Quality gates

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm arch:check   # dependency rules + generated maps consistency
pnpm arch:docs    # regenerate docs/architecture/generated after structural changes
```

CI runs all of the above on every push and pull request.
