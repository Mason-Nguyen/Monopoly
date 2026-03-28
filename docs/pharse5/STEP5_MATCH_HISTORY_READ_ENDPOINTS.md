# Phase 5 - Step 5: Match History Read Endpoints

## Objective

Implement match history read endpoints on top of the existing PostgreSQL and Prisma persistence baseline.

This step completes the first read-focused API surface planned for Phase 5 by exposing durable match list and match detail routes.

## Implemented Scope

The Step 5 implementation includes:

- paginated match history list route
- match detail route by `matchId`
- route-boundary validation for pagination and route params
- shared success and error response envelopes on match routes
- runtime registration of match routes in the API app

## Files Added or Updated

### `apps/api`

- `src/app.ts`
- `src/modules/matches/matches.routes.ts`
- `src/modules/matches/index.ts`

### `docs/pharse5`

- `STEP5_MATCH_HISTORY_READ_ENDPOINTS.md`

## Routes Added

### `GET /matches`

Purpose:

- return a paginated list of durable match history entries

Behavior:

- validates `limit` and `offset` query parameters
- uses the shared pagination schema from Step 2
- returns the shared success envelope with pagination metadata
- returns an empty array when no match history rows exist yet

### `GET /matches/:matchId`

Purpose:

- return a single durable match history record with player snapshots

Behavior:

- validates `matchId` as a UUID
- returns `404 NOT_FOUND` when the match does not exist
- returns the shared success envelope when found

## Response Shaping

The route layer maps internal match summary models into API DTOs with ISO timestamp strings and stable player snapshot fields.

This keeps the HTTP contract independent from repository internals and ready for later frontend match-history screens.

## Notes

- the local development database currently has seeded profile and leaderboard data but no real match rows yet
- because of that, the first verification for this step focuses on empty-list behavior and not-found detail behavior
- once later phases persist completed games, these routes will begin returning non-empty durable match history data without requiring contract changes
- the current API runtime continues to use the verified `tsx src/index.ts` path because of the Prisma generated-client ESM caveat already documented in Step 3

## Exit Criteria

Step 5 is complete when:

- match history reads are exposed through Fastify routes
- pagination inputs are validated through the shared Step 2 validation path
- the local database can be queried successfully through the new match routes
- the workspace remains typecheck- and build-clean after the new routes are added