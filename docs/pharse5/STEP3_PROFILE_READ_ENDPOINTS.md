# Phase 5 - Step 3: Profile Read Endpoints

## Objective

Implement the first real persistence-backed API endpoints by exposing player profile reads through Fastify routes.

This step turns the repository and service scaffolding from Phase 4 into actual HTTP endpoints that the frontend can consume.

## Implemented Scope

The Step 3 implementation includes:

- profile detail route by `userId`
- profile batch-read route by comma-separated `userIds`
- route-boundary validation using the shared Zod helpers from Step 2
- shared success and error response envelopes on real profile routes
- route registration in the API app runtime

## Files Added or Updated

### `apps/api`

- `src/app.ts`
- `src/modules/profiles/profiles.routes.ts`
- `src/modules/profiles/index.ts`
- `package.json`

### `docs/pharse5`

- `STEP3_PROFILE_READ_ENDPOINTS.md`

## Routes Added

### `GET /profiles/:userId`

Purpose:

- return a single durable profile by user identifier

Behavior:

- validates `userId` as a UUID
- returns `404 NOT_FOUND` when the profile does not exist
- returns the shared success envelope when found

### `GET /profiles?userIds=<id1,id2,...>`

Purpose:

- return a batch of profile records for a known set of user identifiers

Behavior:

- validates the `userIds` query parameter as a comma-separated UUID list
- deduplicates repeated IDs in the request
- returns the shared success envelope with request and count metadata

## Response Shaping

The route layer now maps the internal `ProfileSummary` model into an API response DTO with ISO timestamp strings.

This keeps the HTTP contract stable even if the internal service or repository model changes later.

## Notes

- the batch-read route is included because the service and repository scaffolding already supported multi-ID reads and this is useful for later lobby and leaderboard-adjacent UI flows
- current-user auth-specific profile routes are still deferred
- write/update profile endpoints are also deferred

## Exit Criteria

Step 3 is complete when:

- at least one real persistence-backed feature route exists in the API app
- profile reads are exposed through Fastify routes
- route params and query inputs are validated through the shared Step 2 validation path
- the workspace remains typecheck- and build-clean after the new routes are added

## Runtime Note

The API package `start` script now uses `tsx src/index.ts` so the runtime boots the verified source path that currently works cleanly with the Prisma generated client setup.


## Current Caveat

The current TypeScript build remains type- and build-clean, but the compiled Prisma generated client still has a Node ESM runtime-resolution issue under direct `node dist/...` execution. This does not block Step 3 route development because the verified API runtime path for now is `tsx src/index.ts`.
