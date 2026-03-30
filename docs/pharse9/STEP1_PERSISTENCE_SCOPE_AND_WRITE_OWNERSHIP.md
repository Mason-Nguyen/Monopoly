# Phase 9 - Step 1: Persistence Scope and Write Ownership

## Objective

Define exactly what Phase 9 will persist from live rooms, when the write happens, and which runtime owns the write path.

This step is meant to remove ambiguity before any Prisma or game-server implementation begins.

## Core Decision

For the first persistence wave, `apps/game-server` owns the trigger for writing completed live-match results into PostgreSQL.

Reason:

- `MonopolyRoom` is the first place where authoritative finished-match truth exists in runtime
- the room already knows the terminal status, winner, player outcomes, and finish timing
- routing finalized match writes through an HTTP loopback to `apps/api` would add another runtime hop without adding authority

`apps/api` remains the read-side HTTP surface for persisted data.

## Persistence Trigger Boundary

The first-wave persistence trigger should happen only when the authoritative room state becomes `finished`.

This means Phase 9 should not persist:

- room snapshots while the match is still `playing`
- per-turn state changes
- reconnect reservations or temporary disconnect metadata
- idle-timer runtime data

This wave is intentionally finish-oriented rather than event-sourced.

## First-Wave Persistence Moment

The initial implementation should persist the match once at terminal completion.

Approved baseline:

- no database row is required at room creation time
- no partial match row is required while the room is still playing
- the durable write occurs when the room reaches its finalized state

Why this baseline is acceptable for MVP:

- it keeps the first persistence path simple
- it avoids partial durable state for matches that are still evolving in memory
- it matches the current product need, which is durable completed match history

Accepted MVP limitation:

- if the game-server crashes before final persistence runs, that match may be lost from durable history

This limitation is acceptable for the current phase and should be revisited later if stronger durability guarantees are needed.

## Identity Contract for Persisted Matches

For a live match to be persisted in Phase 9, each match participant must map to a valid `users.id` in PostgreSQL.

Approved interpretation for this phase:

- `playerId` in persisted live matches is treated as the durable user identifier
- guest players are still allowed, but they must exist as guest `User` rows before the match result is persisted

This avoids introducing a second identity translation layer inside the persistence path.

## Approved First-Wave Write Scope

Phase 9 should persist the following durable result data in its first wave:

### `matches`

Persist:

- `id`
- `source_lobby_id`
- `board_config_key`
- `status = finished`
- `started_at`
- `finished_at`
- `end_reason`
- `winner_user_id`
- `player_count`

### `match_players`

Persist one row per player with:

- `match_id`
- `user_id`
- `display_name_snapshot`
- `turn_order`
- `start_balance`
- `final_balance`
- `final_position`
- `final_rank`
- `is_bankrupt`
- `is_abandoned`
- `elimination_reason`
- `eliminated_at`

### `leaderboard_stats`

Update from the finalized room result:

- `matches_played`
- `wins`
- `losses`
- `bankruptcies`
- `abandons`
- `last_match_at`

## Explicitly Deferred from the First Wave

The following data is intentionally not required in the first write path:

- per-turn snapshots
- full transaction/event history in `transactions`
- reconnect token details
- room metadata that only matters while the match is live
- frontend-facing result formatting or derived presentation models

This keeps the first implementation wave small, deterministic, and aligned with current product value.

## Idempotency Boundary

Phase 9 must assume that a finalize path can be attempted more than once.

Approved MVP expectation:

- one durable result should exist per `matchId`
- repeated finalize attempts must not create duplicate `matches` rows
- repeated finalize attempts must not double-increment leaderboard totals

This means the implementation should be designed around idempotent write behavior at the match level.

Exact repository mechanics will be defined in later steps, but the ownership requirement is already approved here.

## Failure Ownership Boundary

If persistence fails after the room has already reached a legitimate terminal state:

- the room should remain finished in memory
- the finished gameplay outcome should not be rolled back
- persistence failure should be treated as a durability failure, not as a gameplay failure

This distinction is important:

- gameplay truth remains authoritative in the room and engine
- database durability is a follow-up responsibility of the persistence layer

Retry and recovery details belong to later steps.

## Responsibilities by Runtime

### `packages/game-engine`

Owns:

- gameplay outcome semantics
- winner and elimination truth
- terminal match end reasons

Does not own:

- database writes
- Prisma client usage
- retry mechanics

### `apps/game-server`

Owns:

- detecting finalized live match state
- constructing the persistence snapshot from authoritative room state
- triggering the durable write path
- handling room-local persistence errors and retry boundaries

Does not own:

- HTTP read APIs for persisted history

### `apps/api`

Owns:

- read-side access to persisted match history, leaderboard data, and profile data
- HTTP contracts for external consumers

Does not own:

- authoritative live match completion
- the trigger that decides when a match is finished

## Expected Result After Step 1

After this step:

- the persistence boundary for live match results is explicit
- the project has a clear owner for result writes
- later implementation can proceed without ambiguity about when and where completed match persistence should happen
