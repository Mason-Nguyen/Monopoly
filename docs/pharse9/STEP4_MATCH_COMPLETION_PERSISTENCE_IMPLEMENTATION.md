# Phase 9 - Step 4: Match Completion Persistence Implementation

## Objective

Write finalized live-match results from `MonopolyRoom` into PostgreSQL and trigger that write from the authoritative room-completion path.

This step wires the first real durable write path for completed matches.

## What This Step Adds

Step 4 introduces:

- a completed-match snapshot builder for finished room state
- runtime elimination metadata capture for final ranking and eliminated timestamps
- Prisma-backed persistence of `matches` and `match_players`
- a room-transition processing path that can trigger persistence automatically when the match finishes
- MVP-safe duplicate-finalize handling at the match row level

## Implemented Files

### Snapshot and Persistence Mapping

- `apps/game-server/src/persistence/snapshot.ts`
- `apps/game-server/src/persistence/index.ts`
- `apps/game-server/src/persistence/repositories/completed-match.repository.ts`

### Room Integration

- `apps/game-server/src/services/completed-match-persistence.ts`
- `apps/game-server/src/services/room-lifecycle.ts`
- `apps/game-server/src/services/idle-turn.ts`
- `apps/game-server/src/handlers/game.ts`
- `apps/game-server/src/rooms/MonopolyRoom.ts`
- `apps/game-server/src/lib/room-ids.ts`

## Match ID Persistence Alignment

A key implementation update in this step is that live `matchId` generation now uses UUIDs.

Reason:

- Phase 9 persists live `matchId` directly into the `matches.id` column
- the database schema already defines `matches.id` as `UUID`
- using runtime-prefixed string IDs would have broken durable writes

After this step:

- new live matches now use UUID match identifiers
- the runtime and persistence layers no longer disagree about match identity format

## Snapshot Builder Behavior

The new snapshot builder now:

- accepts only `finished` room state
- resolves durable nullable values from room sentinels such as `""`
- validates that `matchId` and persisted `userId` values are UUIDs
- derives `finalRank` using winner + elimination sequence
- produces leaderboard deltas for later use in Step 5

Current durable write scope in Step 4:

- `matches`
- `match_players`

Leaderboard writes are intentionally deferred to Step 5 even though the snapshot already includes `leaderboardDeltas`.

## Runtime Elimination Metadata

`MonopolyRoom` now maintains runtime-only elimination tracking:

- `eliminationTimeline`
- `nextEliminationSequence`

This data is not synchronized to clients.

Purpose:

- preserve elimination order for ranking
- preserve eliminated timestamps with better accuracy than a pure `finishedAt` fallback

## Room Completion Trigger

A new transition-processing path now runs after authoritative engine transitions.

Behavior:

- record elimination metadata from `player_eliminated` events
- broadcast the normal explicit gameplay events
- if the room has become `finished`, schedule completed-match persistence automatically

This path is now used by:

- gameplay commands
- idle timeout auto-actions
- authoritative abandonment resolution

This ensures the durable write trigger is not tied to only one finish scenario.

## MVP Idempotency Baseline

The repository now treats duplicate finalize attempts safely enough for the current phase:

- if a finished match row already exists for the same `matchId`, the write path exits without creating duplicates
- room runtime also tracks in-memory persistence status to avoid repeated writes in the normal single-room lifecycle

This is an MVP baseline rather than a distributed exactly-once guarantee.

## Explicitly Deferred to Step 5

The following items are still intentionally deferred after Step 4:

- writing `leaderboard_stats`
- stronger idempotency semantics across partial write failure scenarios
- transaction history persistence into `transactions`
- retry queues or outbox-style durability patterns

## Expected Result After Step 4

After this step:

- a finished `MonopolyRoom` can write durable `matches` and `match_players` rows into PostgreSQL
- authoritative room completion is now connected to a real persistence path
- the project is ready for Step 5, where leaderboard updates and idempotency refinement will be added
