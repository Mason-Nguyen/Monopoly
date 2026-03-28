# Phase 4 - Step 3: Prisma Setup and API Integration Baseline

## Objective

Set up Prisma inside `apps/api` as the baseline persistence runtime for PostgreSQL.

This step establishes the Prisma CLI, Prisma configuration, schema location, generated client path, runtime database config handling, and the first API-side integration points needed before the initial schema and migrations are implemented in Step 4.

## Implemented Scope

The Prisma setup baseline includes:

- Prisma and PostgreSQL dependencies in `apps/api`
- Prisma CLI scripts for generate, validate, format, and studio
- `prisma.config.ts` configured for the API app
- `prisma/schema.prisma` configured for PostgreSQL
- generated-client output path configured under `apps/api/generated/prisma`
- runtime database configuration helpers in the API source tree
- a lazy Prisma client singleton
- health endpoint visibility for database configuration status
- `.env.example` updated with a PostgreSQL connection string example

## Files Added or Updated

### `apps/api`

- `package.json`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `src/index.ts`
- `src/config/runtime.ts`
- `src/prisma/config.ts`
- `src/prisma/client.ts`
- `src/prisma/index.ts`
- `src/modules/health/health.routes.ts`

### Workspace Root

- `.env.example`

## Key Decisions Reflected in Code

- Prisma is installed and owned by `apps/api`, not by the game server.
- PostgreSQL configuration flows through `DATABASE_URL`.
- the Prisma client is created lazily so the API process can still start in environments where the database URL is not configured yet.
- the generated Prisma client output is kept inside the API app so the persistence layer remains app-local.
- schema models and migrations are intentionally deferred to Step 4.

## Notes

- Step 3 sets up the persistence runtime baseline only; it does not finalize the relational schema.
- the Prisma client can be generated from the current empty schema baseline.
- database connectivity smoke tests are not the goal of this step; the focus is setup and integration readiness.

## Exit Criteria

Step 3 is complete when:

- Prisma is configured inside `apps/api`
- the API app has a baseline Prisma client integration path
- PostgreSQL env usage is explicit
- the project is ready to move into Prisma schema and migration work in Step 4