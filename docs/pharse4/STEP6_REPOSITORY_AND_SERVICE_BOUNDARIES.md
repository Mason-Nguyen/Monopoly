# Phase 4 - Step 6: Repository and Service Boundaries

## Objective

Define and scaffold the repository and service boundaries for persistence-facing API modules.

This step keeps raw Prisma access contained so later routes, API use cases, and game-result persistence flows can build on stable boundaries instead of coupling directly to the ORM.

## Implemented Scope

The Step 6 implementation includes:

- a shared persistence contract layer for pagination and Prisma client typing
- repository and service scaffolding for the first durable API-facing modules
- explicit separation between Prisma client ownership and use-case orchestration
- module exports that prepare the API app for later route implementation without exposing raw database access everywhere

## Files Added or Updated

### `apps/api`

- `src/common/index.ts`
- `src/common/persistence/contracts.ts`
- `src/common/persistence/index.ts`
- `src/modules/index.ts`
- `src/modules/profiles/profile.types.ts`
- `src/modules/profiles/profiles.repository.ts`
- `src/modules/profiles/profiles.service.ts`
- `src/modules/profiles/index.ts`
- `src/modules/matches/match.types.ts`
- `src/modules/matches/matches.repository.ts`
- `src/modules/matches/matches.service.ts`
- `src/modules/matches/index.ts`
- `src/modules/leaderboard/leaderboard.types.ts`
- `src/modules/leaderboard/leaderboard.repository.ts`
- `src/modules/leaderboard/leaderboard.service.ts`
- `src/modules/leaderboard/index.ts`

### `docs/pharse4`

- `STEP6_REPOSITORY_AND_SERVICE_BOUNDARIES.md`

## Boundary Model Adopted

The API persistence layer now follows this baseline structure:

- routes call services
- services orchestrate use-case rules and cross-module flows
- repositories own Prisma queries and data selection
- `src/prisma` owns Prisma client creation and database configuration

This keeps the ORM boundary narrow and makes later testing and refactoring much easier.

## Module Responsibilities

### `profiles`

The `profiles` module is responsible for stable player identity reads used by UI-facing flows.

The repository owns profile and user joins, while the service exposes profile lookup operations without leaking raw Prisma query details upward.

### `matches`

The `matches` module is responsible for durable match-history reads.

The repository owns match and match-player selection, while the service exposes list and detail use cases for later match history endpoints.

### `leaderboard`

The `leaderboard` module is responsible for durable aggregate ranking reads.

The repository owns leaderboard ordering and profile joins, while the service exposes stable leaderboard read use cases for later API routes.

## Shared Persistence Contracts

The shared persistence contract layer currently provides:

- `PrismaDatabaseClient`
- `PrismaTransactionClient`
- `PaginationOptions`
- `PaginatedResult`
- `normalizePaginationOptions()`

This gives repository modules a consistent baseline without prematurely introducing a heavy generic repository abstraction.

## Important Architectural Rules

- only repository classes should call Prisma model delegates directly
- services should depend on repository contracts, not raw Prisma model delegates
- Fastify route handlers should call services, not repositories or Prisma client helpers directly
- Colyseus room logic should not import Prisma access from `apps/api`; later persistence integration should happen through explicit persistence flows or service boundaries
- the seed script remains an allowed exception because it is an operational bootstrap tool, not request-path application logic

## Notes

- this step intentionally scaffolds read-oriented boundaries first because match result writes are not fully implemented yet
- no new API routes are registered in this step
- the repository/service layer is designed to be expanded incrementally as authentication, profile APIs, match history APIs, and leaderboard APIs are implemented

## Exit Criteria

Step 6 is complete when:

- repository and service responsibilities are documented
- the API app has persistence-facing scaffolding for the first durable modules
- Prisma access is no longer expected to leak directly into future route handlers
- the workspace remains typecheck- and build-clean after the new persistence boundaries are added