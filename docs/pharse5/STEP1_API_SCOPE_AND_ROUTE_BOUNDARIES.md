# Phase 5 - Step 1: API Scope and Route Boundaries

## Objective

Define the exact scope of the HTTP API for Phase 5 and draw a clear boundary between application-facing backend routes and Colyseus-owned multiplayer runtime behavior.

## Why This Step Matters

The project now has a verified PostgreSQL and Prisma baseline, but not every planned backend concern is equally ready to become an HTTP endpoint.

If we do not lock these boundaries now, the API layer can easily drift into responsibilities that should remain inside Colyseus rooms or future game-completion flows.

## Phase 5 API Ownership Model

The backend API in `apps/api` owns HTTP endpoints for durable and application-facing concerns such as:

- profile data
- leaderboard data
- match history data
- future auth and guest session bootstrapping
- API-safe validation and error responses

The Colyseus game server in `apps/game-server` remains responsible for:

- room lifecycle
- lobby membership
- active match state
- live turn progression
- reconnect handling during a running match
- command validation for gameplay actions

## Route Areas That Are Ready Now

Based on the completed Phase 4 persistence work, the following route areas are ready to enter implementation during Phase 5:

### Profiles

Reason:

- durable profile and user seed data already exist
- repository and service scaffolding for profile reads already exists

Expected route direction:

- `GET /profiles/:userId`
- optional batch-read or current-user shapes can be added later if needed

### Leaderboard

Reason:

- durable aggregate leaderboard data already exists
- repository and service scaffolding for leaderboard reads already exists

Expected route direction:

- `GET /leaderboard`
- support pagination-ready query parameters from the start

### Match History

Reason:

- relational match-history model already exists
- repository and service scaffolding for match reads already exists even if the tables are not populated yet

Expected route direction:

- `GET /matches`
- `GET /matches/:matchId`

This route area is structurally ready even though the local dev database currently has little or no real match data.

## Route Areas That Should Wait

### Live Room Listing

This should not be treated as a normal persistence-backed API in the current phase.

Reason:

- real room data belongs to the active runtime managed by Colyseus
- Phase 7 has not yet integrated the live lobby and game-room lifecycle fully
- exposing a fake or stale room listing from PostgreSQL now would create the wrong contract

Decision:

- defer real room-listing APIs until Colyseus integration provides a trustworthy source or an explicit synchronization strategy

### In-Match Gameplay HTTP APIs

These should not exist in Phase 5.

Reason:

- gameplay commands belong in Colyseus room message flows, not HTTP routes
- duplicating turn actions over HTTP would weaken the authoritative server model

Decision:

- keep gameplay commands out of `apps/api`

### Full Authentication Implementation

This should not be the first implementation target of Phase 5.

Reason:

- secure password handling and production auth flows are not yet fully modeled
- the seeded data currently supports profile and leaderboard development better than a finished auth experience

Decision:

- allow auth contract planning in Phase 5, but prioritize seeded read APIs first

## Recommended Phase 5 Implementation Order

1. Add shared API response and error conventions.
2. Implement profile read routes.
3. Implement leaderboard read routes.
4. Implement match history read routes.
5. Apply validation and consistent error handling across those routes.

This order gives the frontend a useful integration surface quickly while keeping the API grounded in already verified persistence data.

## Technical Boundary Rules

- Fastify routes should depend on services, not repositories directly.
- Services should depend on repository contracts, not raw Prisma model delegates.
- Prisma client creation remains centralized in `src/prisma`.
- `apps/api` must not import Colyseus room classes.
- `apps/game-server` should not reach into `apps/api` request-path modules.
- any future game-result persistence handoff should happen through explicit persistence services or integration hooks, not by letting room logic call route handlers.

## Step 1 Decision Summary

The approved first-wave Phase 5 API scope is:

- profile reads
- leaderboard reads
- match history reads
- shared API contracts
- validation and error-handling baseline

The following items are explicitly deferred beyond the first-wave scope:

- live room-listing endpoints
- gameplay action endpoints
- full production auth implementation

## Exit Criteria

Step 1 is complete when:

- the ownership boundary between `apps/api` and `apps/game-server` is documented
- the first Phase 5 route areas are clearly approved
- deferred areas are explicitly named
- the next implementation step can proceed without scope ambiguity