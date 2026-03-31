# Phase 10 - Step 4: Persistence Integration Tests

## Objective

Add automated persistence integration tests for completed live matches so PostgreSQL result recording no longer depends only on smoke scripts.

This step focuses on the durable write path introduced in Phase 9.

## What This Step Adds

Step 4 introduces:

- a dedicated PostgreSQL-backed persistence integration test file
- reusable persistence test support for finished-room fixtures with real seeded user ids
- automated verification for match rows, match-player rows, leaderboard updates, and duplicate-finalize no-op behavior

## Implemented Files

### Persistence Integration Tests

- `apps/game-server/tests/completed-match-persistence.integration.test.ts`

### Additional Test Support

- `apps/game-server/tests/support/persistence.ts`
- `apps/game-server/tests/support/index.ts`

### Package Script Update

- `apps/game-server/package.json`

## Runtime Direction Chosen in Step 4

Persistence integration tests now use source-level execution with `node --import tsx --test` instead of the compiled room-test runtime from Step 3.

Reason:

- Prisma generated client behavior remains healthier in the current source-level path than through compiled test output
- Step 4 verifies persistence services directly, so it does not need the compiled room-runtime fallback used for the Colyseus-heavy tests in Step 3

Current test command:

- `npm run test:persistence --workspace @monopoly/game-server`

## Database Preconditions

Step 4 assumes:

- `DATABASE_URL` is set
- PostgreSQL is available
- Phase 4 migrations and seed data have already been applied

Current persistence tests intentionally target the existing seeded demo users so leaderboard updates can be asserted against known rows and then restored after the test run.

If `DATABASE_URL` is not set, the persistence test file is skipped instead of failing the whole test command.

## Coverage Added in Step 4

The first persistence integration suite now covers the following critical paths.

### Completed Match Persistence

Verified by test:

- `persistCompletedMonopolyRoomIfNeeded(...)` writes a finished room into `matches`
- the same persistence flow writes `match_players`
- leaderboard deltas are applied into `leaderboard_stats`
- persisted rows match the authoritative finished-room snapshot

### Duplicate Finalize No-Op Behavior

Verified by test:

- calling completed-match persistence twice for the same `matchId` does not create duplicate `matches`
- calling the same persistence flow twice does not create duplicate `match_players`
- leaderboard counters are not incremented more than once for the same finished match

## Cleanup Strategy

The persistence suite now restores the local database after each test by:

- deleting the temporary `match_players` rows for the generated test `matchId`
- deleting the temporary `matches` row for the generated test `matchId`
- restoring the original `leaderboard_stats` values for the seeded users used in the test
- disconnecting the shared game-server Prisma client after each test run

This keeps the local development database stable and repeatable.

## Helper Additions Introduced in Step 4

### `support/persistence.ts`

Provides:

- seeded persistence-test player identities using known UUID-backed demo users
- a reusable finished-room fixture with deterministic balances, elimination state, and elimination timeline

This keeps the persistence suite aligned with the same authoritative snapshot rules already used in Phase 9.

## What Step 4 Does Not Yet Cover

Step 4 intentionally does not yet cover:

- persistence failure-path assertions
- retry-status behavior when repository writes throw
- transport-level room plus database assertions in the same end-to-end test

Those items belong in later Phase 10 steps.

## Expected Result After Step 4

After this step:

- completed-match persistence is covered by repeatable automated tests instead of smoke-only scripts
- leaderboard idempotency is verified automatically at the database level
- the project is ready for Step 5 failure-path verification
