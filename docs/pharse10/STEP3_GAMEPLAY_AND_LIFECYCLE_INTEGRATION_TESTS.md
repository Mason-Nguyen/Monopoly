# Phase 10 - Step 3: Gameplay and Lifecycle Integration Tests

## Objective

Add the first real automated room-level integration tests for critical gameplay and lifecycle behavior in `MonopolyRoom`.

This step converts the most important Phase 8 and Phase 9 multiplayer smoke scenarios into repeatable automated tests.

## What This Step Adds

Step 3 introduces:

- a compiled test runtime for `apps/game-server`
- the first room-level integration test file for critical multiplayer flows
- additional reusable test helpers for clock control, random control, room seeding, and client message capture

## Implemented Files

### Test Runtime Setup

- `apps/game-server/package.json`
- `apps/game-server/tsconfig.tests.json`

### Additional Test Support

- `apps/game-server/tests/support/contracts.ts`
- `apps/game-server/tests/support/clients.ts`
- `apps/game-server/tests/support/clock.ts`
- `apps/game-server/tests/support/random.ts`
- `apps/game-server/tests/support/room.ts`
- `apps/game-server/tests/support/index.ts`

### Room Integration Tests

- `apps/game-server/tests/monopoly-room.integration.test.ts`

## Runtime Direction Chosen in Step 3

The room integration tests now run through compiled test output instead of source-level `tsx` execution.

Reason:

- the current Windows environment has already shown sandbox and decorator-runtime instability for some source-level room flows
- compiling tests and runtime code through TypeScript gives a more stable path for `MonopolyRoom` integration verification

Current test command:

- `npm run test:integration --workspace @monopoly/game-server`

This command builds `tsconfig.tests.json` output into `dist-tests` and then runs Node's built-in test runner on the compiled room test file.

## Coverage Added in Step 3

The first room integration suite now covers the following critical paths.

### Gameplay Command Happy Path

Verified by test:

- active player can `rollDice`
- room enters `await_optional_action` on an unowned property
- player can `buyProperty`
- room enters `await_end_turn`
- player can `endTurn`
- turn advances to the next player
- explicit success events emit in the expected order

### Invalid Command Rejection

Verified by test:

- inactive players cannot execute active-player commands
- invalid command attempts do not mutate room turn state
- the client receives the expected `game:error` payload

### Unknown Join Rejection

Verified by test:

- players who are not part of the seeded active match cannot join mid-match

### Seat Reclaim Behavior

Verified by test:

- reserved seats can be reclaimed through reconnect flow
- reconnect does not create duplicate player entries
- connection-change broadcast emits correctly on reclaim

### Authoritative Abandonment via Drop Expiry

Verified by test:

- failed reconnection after drop routes through authoritative abandonment
- eliminated player state updates correctly
- match can finish from abandonment when only one player remains
- required finish events emit in order

### Idle Timeout Progression

Verified by test:

- idle timeout can auto-roll
- idle timeout can auto-skip the optional purchase phase
- idle timeout can auto-end the turn
- no idle timeout is scheduled while the active player is temporarily disconnected

## Helper Additions Introduced in Step 3

### `clock.ts`

Provides a fake room clock so idle timeout behavior can be tested without waiting for real time.

### `random.ts`

Provides a temporary `Math.random` override helper so command-path dice rolls remain deterministic during tests.

### `room.ts`

Provides a seeded-room factory so tests start from a consistent `MonopolyRoom` baseline.

### Updated `clients.ts`

The client helper now records `send(...)` calls so tests can assert `game:error` behavior in addition to room broadcasts.

## What Step 3 Does Not Yet Cover

Step 3 intentionally does not yet cover:

- PostgreSQL persistence integration tests
- duplicate-finalize database assertions
- persistence failure-path verification

Those items belong in later Phase 10 steps.

## Expected Result After Step 3

After this step:

- the project has the first repeatable automated room-integration coverage for multiplayer runtime behavior
- critical gameplay and lifecycle flows no longer rely only on smoke scripts
- the project is ready for Step 4 persistence-focused integration tests

