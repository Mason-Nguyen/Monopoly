# Phase 9 - Step 3: Game-Server Persistence Adapter Setup

## Objective

Add the minimum persistence runtime needed inside `apps/game-server` so the game-server can own completed-match writes in later steps without coupling transport code directly to raw Prisma calls.

This step sets up the adapter and boundaries. It does not yet wire the finalized room write path.

## What This Step Adds

Step 3 introduces:

- a dedicated Prisma schema for the game-server write-side persistence subset
- a game-server Prisma runtime client using `DATABASE_URL`
- snapshot contracts for completed-match persistence
- repository scaffolding for completed-match writes
- a service boundary that the room layer can call later without depending on Prisma directly

## Implemented Files

### Prisma and Runtime Setup

- `apps/game-server/prisma/schema.prisma`
- `apps/game-server/prisma.config.ts`
- `apps/game-server/package.json`
- `apps/game-server/src/index.ts`

### Persistence Layer

- `apps/game-server/src/persistence/config.ts`
- `apps/game-server/src/persistence/client.ts`
- `apps/game-server/src/persistence/contracts.ts`
- `apps/game-server/src/persistence/repositories/completed-match.repository.ts`
- `apps/game-server/src/persistence/index.ts`

### Service Boundary

- `apps/game-server/src/services/completed-match-persistence.ts`
- `apps/game-server/src/services/index.ts`

## Prisma Scope for Game-Server

The game-server Prisma schema is intentionally smaller than the API Prisma schema.

It currently includes only the models needed for the first write-side wave:

- `Match`
- `MatchPlayer`
- `LeaderboardStat`

This keeps the game-server focused on completed-match result recording instead of inheriting the entire read-side API persistence surface.

## Runtime Boundary Established

After this step:

- room and handler code still do not call Prisma directly
- future finalized write logic should go through the completed-match persistence service
- repository code owns database access details
- the Prisma client is created lazily and only when persistence is actually used

## Snapshot Contracts Added

The game-server now has local TypeScript contracts for:

- `CompletedMatchPersistenceSnapshot`
- `PersistedMatchSnapshot`
- `PersistedMatchPlayerSnapshot`
- `PersistedLeaderboardDelta`

These contracts mirror the design approved in Step 2 and give later implementation steps a stable write-side interface.

## Current Repository Scope

The completed-match persistence repository now supports:

- checking whether a completed match already exists in durable storage

The actual finalized write method is intentionally still a placeholder in Step 3.

That write path is deferred to Step 4, where room completion will start persisting real match results.

## Environment Setup Notes

The game-server runtime now loads environment variables through `dotenv/config` so the persistence layer can read `DATABASE_URL` during local development.

The Prisma client uses the same PostgreSQL URL pattern already established for the API runtime.

## Expected Result After Step 3

After this step:

- `apps/game-server` has its own minimal write-side Prisma runtime
- persistence dependencies are isolated behind repository and service boundaries
- the project is ready for Step 4, where completed live matches will start writing durable records into PostgreSQL
