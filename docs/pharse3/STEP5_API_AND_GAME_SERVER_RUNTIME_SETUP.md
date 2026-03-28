# Phase 3 - Step 5: API and Game Server Runtime Setup

## Objective

Turn `apps/api` and `apps/game-server` from placeholder packages into real server runtimes with actual dev and build scripts.

This step creates the baseline server entry points, runtime configuration, and health endpoints needed before Colyseus room/schema work begins in Step 6.

## Implemented Scope

The server runtime setup includes:

- real Node.js TypeScript dev scripts using `tsx watch`
- real TypeScript build scripts using `tsc`
- Fastify runtime setup for `apps/api`
- Colyseus runtime setup for `apps/game-server`
- environment-based runtime configuration for both server apps
- health endpoints for baseline verification
- updated TypeScript config for Node-side applications

## Files Added or Updated

### `apps/api`

- `package.json`
- `tsconfig.json`
- `src/app.ts`
- `src/index.ts`
- `src/config/runtime.ts`
- `src/config/index.ts`
- `src/modules/health/health.routes.ts`
- `src/modules/health/index.ts`
- `src/modules/index.ts`
- `src/common/index.ts`
- `src/prisma/index.ts`

### `apps/game-server`

- `package.json`
- `tsconfig.json`
- `src/app.config.ts`
- `src/index.ts`
- `src/config/runtime.ts`
- `src/config/index.ts`
- `src/services/metadata.ts`
- `src/services/index.ts`
- placeholder exports kept in `handlers`, `lib`, `rooms`, and `schemas`

## Key Decisions Reflected in Code

- `apps/api` uses Fastify as the initial backend runtime foundation.
- `apps/game-server` uses Colyseus as the multiplayer server runtime foundation.
- both server apps now use Node-oriented TypeScript configuration (`NodeNext`)
- both server apps expose health endpoints so install and runtime verification can happen later without waiting for feature code
- room classes and Colyseus schemas are intentionally deferred to Step 6

## Notes

- Dependencies are declared but not installed in this step.
- Room registration has not started yet.
- Prisma wiring remains a placeholder until the API foundation steps begin.
- Workspace build verification is still planned for Phase 3 Step 7.

## Exit Criteria

Step 5 is complete when:

- `apps/api` has a real Fastify runtime entry flow
- `apps/game-server` has a real Colyseus runtime entry flow
- both server apps expose real dev/build scripts
- both packages are structurally ready for dependency installation and later build verification