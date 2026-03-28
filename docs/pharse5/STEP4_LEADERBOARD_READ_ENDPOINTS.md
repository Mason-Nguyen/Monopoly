# Phase 5 - Step 4: Leaderboard Read Endpoints

## Objective

Implement leaderboard read endpoints on top of the verified PostgreSQL and Prisma persistence baseline.

This step gives the frontend a real ranking API backed by durable seeded data and aligned with the shared response and validation model introduced in Step 2.

## Implemented Scope

The Step 4 implementation includes:

- paginated leaderboard list route
- leaderboard entry route by `userId`
- route-boundary validation for pagination and route params
- shared success and error response envelopes on leaderboard routes
- runtime registration of leaderboard routes in the API app

## Files Added or Updated

### `apps/api`

- `src/app.ts`
- `src/modules/leaderboard/leaderboard.routes.ts`
- `src/modules/leaderboard/index.ts`

### `docs/pharse5`

- `STEP4_LEADERBOARD_READ_ENDPOINTS.md`

## Routes Added

### `GET /leaderboard`

Purpose:

- return paginated leaderboard entries ordered by the current repository ranking logic

Behavior:

- validates `limit` and `offset` query parameters
- uses the shared pagination schema from Step 2
- returns page-local ranks derived from `offset + index + 1`
- returns pagination metadata in the shared response envelope

### `GET /leaderboard/:userId`

Purpose:

- return a single leaderboard entry for a specific user

Behavior:

- validates `userId` as a UUID
- returns `404 NOT_FOUND` when no leaderboard entry exists for that user
- returns the shared success envelope when found

## Response Shaping

The route layer maps internal leaderboard models into API DTOs with ISO timestamp strings.

The list route adds a `rank` field for the current page so the frontend can render ordered leaderboard entries directly.

## Notes

- leaderboard ordering currently follows the repository strategy already defined in Phase 4: wins descending, then matches played descending, then updated time descending
- total-count pagination is intentionally not added yet because the current repository layer does not expose it and the first API wave only needs offset/limit reads
- the current API runtime continues to use the verified `tsx src/index.ts` path because of the Prisma generated-client ESM caveat already documented in Step 3

## Exit Criteria

Step 4 is complete when:

- leaderboard reads are exposed through Fastify routes
- pagination inputs are validated through the shared Step 2 validation path
- the seeded local database can be queried successfully through the new leaderboard routes
- the workspace remains typecheck- and build-clean after the new routes are added