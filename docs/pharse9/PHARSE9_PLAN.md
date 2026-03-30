# Phase 9 - Live Match Persistence and Result Recording

## Purpose

Phase 9 brings the multiplayer runtime into the persistence layer by recording completed live matches from `MonopolyRoom` into PostgreSQL.

Earlier phases already established:

- PostgreSQL schema and Prisma baseline
- read-side API endpoints for profiles, leaderboard, and match history
- pure engine authority for gameplay rules
- room lifecycle hardening for disconnect, reconnect, abandonment, and idle handling

Phase 9 is where finished room outcomes begin to become durable product data.

## Phase 9 Goal

Create a reliable first-wave persistence path so a finished live match can be written from the game-server into PostgreSQL without weakening runtime authority or duplicating business logic.

## Inputs from Previous Phases

Phase 9 builds directly on:

- Phase 4 persistence schema and Prisma setup
- Phase 5 read-side API contracts and routes
- Phase 7 room integration with the pure engine
- Phase 8 reconnect, abandonment, and idle-turn lifecycle hardening

## Required End State for Phase 9

By the end of Phase 9:

- a finished `MonopolyRoom` can produce a durable match record in PostgreSQL
- the write path is clearly owned and documented
- persistence is idempotent enough for MVP retry safety
- leaderboard updates are derived from authoritative match results
- verification notes cover the room-to-database persistence flow

## Phase 9 Deliverables

By the end of Phase 9, the project should have:

- persistence-scope and ownership documentation
- match-result snapshot and mapping design
- persistence adapter/runtime setup for `apps/game-server`
- completed-match write implementation
- leaderboard update strategy and implementation
- verification notes for the persistence path
- Phase 9 sign-off

## Recommended Step Order

### Step 1 - Persistence Scope and Write Ownership

Focus:

- define what data should be persisted from live rooms in the first wave
- decide which runtime owns the write trigger
- define the persistence moment and durability boundaries

Output:

- persistence scope document
- approved ownership model for room-result writes

### Step 2 - Match Result Snapshot and Mapping Design

Focus:

- define the room-state to database-write snapshot shape
- map room and engine result fields into `matches`, `match_players`, and leaderboard updates
- define how end reasons and elimination reasons are translated into persistence enums

Output:

- persistence snapshot design
- field mapping notes for database writes

### Step 3 - Game-Server Persistence Adapter Setup

Focus:

- add the minimal Prisma/runtime setup needed inside `apps/game-server`
- keep persistence dependencies isolated from transport logic
- create repository/service boundaries for live match persistence

Output:

- game-server persistence baseline
- repository/service scaffolding for result writes

### Step 4 - Match Completion Persistence Implementation

Focus:

- write finished match data from `MonopolyRoom` into PostgreSQL
- trigger persistence from the authoritative room-completion path
- keep retries and duplicate-finalize behavior safe enough for MVP

Output:

- completed-match persistence implementation
- room integration for finalized match writes

### Step 5 - Leaderboard Update and Idempotency Strategy

Focus:

- update leaderboard stats from authoritative persisted match outcomes
- prevent duplicate leaderboard increments on repeated finalize attempts
- document MVP retry behavior and failure handling

Output:

- leaderboard update implementation
- idempotency handling notes

### Step 6 - Verification and Runtime Notes

Focus:

- verify the room-to-database persistence path locally
- confirm typecheck, build, and persistence-path tests
- document known runtime gaps that remain intentionally deferred

Output:

- persistence verification notes
- runtime caveat list for live-result recording

### Step 7 - Sign-Off

Focus:

- confirm the project now has a durable first-wave persistence path for completed live matches
- document the approved handoff into the next implementation phase

Output:

- Phase 9 sign-off document

## Working Principles for Phase 9

- `MonopolyRoom` remains the runtime authority for deciding when a match is truly finished
- `packages/game-engine` remains the gameplay-rule authority for why the match finished
- PostgreSQL stores durable outcomes, not live room synchronization state
- persistence writes must not require replaying room logic on the API side
- the first wave should prefer simple, deterministic, idempotent result recording over ambitious event sourcing

## Planned In-Scope Areas

The first implementation wave of Phase 9 should focus on:

- completed-match writes from `apps/game-server`
- `matches` and `match_players` persistence
- leaderboard stat updates from finalized results
- verification of idempotent-ish MVP result recording

## Explicitly Deferred or Limited Areas

The following areas are not the main target of Phase 9:

- per-turn event sourcing or full transaction history persistence
- persistence of still-playing matches
- frontend result screens and post-match UX polish
- Redis-backed distributed exactly-once coordination
- advanced retry queues and production-grade outbox/inbox patterns

## Expected Handoff After Phase 9

Once Phase 9 is complete, the project should be ready to continue with:

- richer frontend integration against persisted match history and live room state together
- automated room integration tests with stronger transport realism
- post-match UX flows such as result screens, reconnect-after-finish handling, and history refresh
