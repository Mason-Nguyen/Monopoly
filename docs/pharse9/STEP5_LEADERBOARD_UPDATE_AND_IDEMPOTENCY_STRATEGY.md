# Phase 9 - Step 5: Leaderboard Update and Idempotency Strategy

## Objective

Update `leaderboard_stats` from authoritative completed-match results and keep repeated finalize attempts from incrementing leaderboard totals more than once.

## What This Step Adds

Step 5 extends the completed-match write path by:

- writing `leaderboard_stats` inside the same database transaction as `matches` and `match_players`
- deriving all leaderboard changes from `CompletedMatchPersistenceSnapshot.leaderboardDeltas`
- making duplicate finalize attempts no-op for both match rows and leaderboard counters once a finished match already exists
- keeping `last_match_at` monotonic so older persisted matches do not overwrite a newer leaderboard timestamp

## Implemented Files

- `apps/game-server/src/persistence/repositories/completed-match.repository.ts`
- `docs/pharse9/STEP5_LEADERBOARD_UPDATE_AND_IDEMPOTENCY_STRATEGY.md`

## Leaderboard Update Strategy

The write path now treats leaderboard updates as part of completed-match persistence rather than a second independent follow-up task.

Transaction flow:

1. check whether the match already exists
2. if a finished match row already exists, exit early
3. create the durable `matches` row
4. create the durable `match_players` rows
5. update or create `leaderboard_stats` rows for every player in the same transaction

This keeps the durable product record and leaderboard aggregates in sync.

## Source of Truth

Leaderboard counters are still derived entirely from authoritative room results.

The repository does not recalculate business rules on its own. It only applies the already-derived deltas from the persistence snapshot:

- `matchesPlayedDelta`
- `winsDelta`
- `lossesDelta`
- `bankruptciesDelta`
- `abandonsDelta`
- `lastMatchAt`

## Idempotency Baseline in Step 5

Step 5 improves MVP idempotency in two ways:

- duplicate finalize attempts exit before any leaderboard increment when a finished `matches` row already exists for the same `matchId`
- leaderboard writes happen in the same transaction as the match write, so partial success cannot leave leaderboard counters incremented without the match record that justified them

This is still an MVP-safe baseline rather than a distributed exactly-once guarantee.

## `last_match_at` Handling

Leaderboard updates now preserve the latest known match timestamp per user.

If an older finished match is persisted after a newer one, the repository keeps the existing newer `last_match_at` value instead of moving it backwards.

## Explicitly Deferred After Step 5

The following items are still deferred:

- ranked MMR or Elo-style scoring
- persistence of full transaction history into `transactions`
- retry queues or outbox/inbox reliability patterns
- cross-process exactly-once guarantees beyond the current transactional baseline

## Expected Result After Step 5

After this step:

- completed matches persist `matches`, `match_players`, and `leaderboard_stats`
- repeated finalize attempts are safe enough for MVP and do not double-increment leaderboard counters
- the project is ready for Step 6 verification focused on the full room-to-database persistence path
