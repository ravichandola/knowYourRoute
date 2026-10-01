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

Requirements: Node >= 20.19 (see `.nvmrc`; `@nestjs/jwt` v12 is an ES module loaded with `require()`), pnpm (version pinned in `package.json`), Docker.

```bash
# 1. Install dependencies
pnpm install

# 2. Create your environment file
pnpm setup:env          # copies .env.example -> .env
# Edit .env if needed (defaults work for local dev)

# 3. Start infrastructure (PostgreSQL, Redis, MinIO)
pnpm infra:up           # docker compose up -d

# 4. Run database migrations, generate Prisma client, create the dev demo user
pnpm db:migrate         # prisma migrate dev
pnpm db:generate        # prisma generate
pnpm db:seed            # idempotent; refuses to run in production

# 5. Start the API
pnpm dev:api            # http://localhost:4000/api/v1 (Swagger: /api/docs)

# 6. Start the mobile app
pnpm dev:mobile         # Expo: i = iOS, a = Android, w = web
```

`pnpm dev` runs both API and mobile. Packages are built automatically before `dev`, `typecheck`, `test` and `build` (Turborepo).

The login screen has a demo sign-in. With the default `prisma` driver the demo user comes from `pnpm db:seed` (the demo vehicle and FASTag exist only with `PERSISTENCE_DRIVER=memory`). Demo login is disabled in production.

The local S3-compatible store is [Silo](https://github.com/pgsty/silo) (`pgsty/silo`), a maintained MinIO-compatible fork, because MinIO stopped publishing Docker Hub images. The app only speaks S3, so any S3-compatible server works.

## Health checks

```bash
curl http://localhost:4000/health        # liveness
curl http://localhost:4000/health/ready  # readiness (checks PostgreSQL + Redis)
```

## Environment variables

See [`.env.example`](./.env.example) for the full list. Key variables:

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | yes | `development`, `test`, or `production` |
| `PORT` | no | API port (default: 4000) |
| `DATABASE_URL` | when `PERSISTENCE_DRIVER=prisma` | PostgreSQL connection string |
| `REDIS_URL` | production | Redis connection string |
| `JWT_SECRET` | yes | JWT signing secret (>=32 chars in production) |
| `CORS_ORIGINS` | production | Comma-separated allowed origins |
| `STORAGE_ENABLED` | no | Enable S3/MinIO object storage (`true`/`false`) |
| `PERSISTENCE_DRIVER` | no | `prisma` (default) or `memory` (unit tests) |

Production requires: `DATABASE_URL`, `REDIS_URL`, strong `JWT_SECRET`, explicit `CORS_ORIGINS`, `PERSISTENCE_DRIVER=prisma`.

## Database workflow

```bash
# Create a new migration after changing prisma/schema.prisma
pnpm db:migrate                    # runs prisma migrate dev (generates + applies)

# Deploy existing migrations to a clean/production database
pnpm db:migrate:deploy             # runs prisma migrate deploy

# Reset dev database (destroys data)
pnpm db:migrate:reset              # runs prisma migrate reset

# Check migration status
pnpm db:status

# Regenerate Prisma client without migrating
pnpm db:generate

# Fail if the migrated database differs from schema.prisma (also run in CI)
pnpm --filter @know-your-route/api db:drift
```

`db:*` scripts read the root `.env` (via `dotenv-cli`) and never override variables already set in the process, so CI can inject its own.

## Configuration switches

Chosen once at boot; unknown values stop the server with a clear error.

```bash
PERSISTENCE_DRIVER=prisma   # prisma (default) | memory
MAP_PROVIDER=mock
WEATHER_PROVIDER=mock
VEHICLE_PROVIDER=mock
FASTAG_PROVIDER=mock
AI_PROVIDER=mock
```

Adding a real provider means implementing the module's port in `infrastructure/` and registering it in that
module's `*.module.ts` (see the architecture guide).

## Quality gates

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm arch:check   # dependency rules + generated maps consistency
pnpm arch:docs    # regenerate docs/architecture/generated after structural changes
```

`pnpm lint` runs ESLint (no `console` and no `process.env` in API code outside the validated config), a check that mobile code makes no raw `fetch` calls or hardcoded URLs, and each workspace's type check. Pre-existing unused-variable findings in feature code are warnings, not errors.

Rate limits are stored in Redis (`throttle:` keys) so every API instance shares one counter. When Redis is not configured (development/test), the limit is in-memory for that process only.

CI runs all of the above (plus database migrations and a Prisma drift check) on every push and pull request against `main` and `develop`. CI uses PostgreSQL 16 and Redis 7 service containers.

## Infrastructure commands

```bash
pnpm infra:up      # Start PostgreSQL, Redis, MinIO via Docker Compose
pnpm infra:down    # Stop infrastructure
pnpm setup:env     # Copy .env.example to .env
```

## Frozen architectural rules

> Mobile talks to API. API owns business logic. PostgreSQL owns persistent state. Redis owns transient/cache state. External providers are accessed only through backend adapters. Shared contracts remain the single source of truth.
