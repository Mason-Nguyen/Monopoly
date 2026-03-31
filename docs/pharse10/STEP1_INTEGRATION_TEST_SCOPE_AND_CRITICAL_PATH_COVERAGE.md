# Phase 10 - Step 1: Integration Test Scope and Critical Path Coverage

## Objective

Define exactly what Phase 10 must verify automatically so multiplayer regressions are caught before the project moves heavily into frontend implementation.

This step does not add test code yet.

This step locks the scope, the verification priorities, and the boundaries between existing engine-unit tests and the new room-level integration layer.

## Why This Step Matters

The project already has good coverage at the pure-engine level, but the most fragile behavior now lives one layer above that engine:

- Colyseus room orchestration
- reconnect and abandonment runtime handling
- idle timeout orchestration
- explicit event broadcasting
- completed-match persistence into PostgreSQL

Those behaviors have been smoke-tested during earlier phases, but Phase 10 needs repeatable automated coverage for the most important paths.

## Existing Coverage Before Phase 10

Current automated coverage already exists for:

- pure gameplay rules in `packages/game-engine`
- movement, economy, jail, bankruptcy, and lifecycle rules at engine level

Current coverage is still mostly smoke/manual for:

- room-level command execution
- room-level reconnect and abandon orchestration
- room-level idle timeout orchestration
- finished-match persistence into PostgreSQL
- leaderboard update idempotency through runtime services

## Test Layers for Phase 10

Phase 10 should use three clear verification layers.

### Layer 1 - Engine Unit Tests

Purpose:

- verify pure gameplay rules in isolation

Current status:

- already exists and remains the authority for gameplay-rule correctness

Phase 10 expectation:

- keep these tests green
- do not duplicate pure rule assertions unnecessarily in room tests

### Layer 2 - Room Integration Tests

Purpose:

- verify that `MonopolyRoom` correctly orchestrates authoritative gameplay, lifecycle behavior, state sync, and explicit event flow

What belongs here:

- gameplay command handling
- active-player validation
- reconnect reservation and reclaim behavior
- abandonment handling
- idle timeout behavior
- event broadcast ordering for critical flows

### Layer 3 - Persistence Integration Tests

Purpose:

- verify that finished-room outcomes persist correctly into PostgreSQL

What belongs here:

- `matches` persistence
- `match_players` persistence
- `leaderboard_stats` updates
- duplicate-finalize no-op behavior
- current persistence status handling for success and failure cases

## Critical Paths That Must Be Covered

The following scenarios are the minimum approved coverage target for Phase 10.

### Path 1 - Gameplay Command Happy Path

Must verify:

- a seeded room can accept valid gameplay commands from the active player
- room state changes correctly after `rollDice`, `buyProperty`, and `endTurn`
- explicit success events are emitted in the expected order for the command flow

### Path 2 - Invalid Command Rejection

Must verify:

- inactive players cannot execute active-player commands
- invalid commands do not mutate room state
- invalid commands produce the expected error event or error path

### Path 3 - Reconnect Reservation and Reclaim

Must verify:

- disconnect reserves the original player seat
- reconnect restores control of the same seat
- unknown players cannot join an active seeded room mid-match
- reconnect does not create duplicate player entries

### Path 4 - Authoritative Abandonment

Must verify:

- reconnect expiry or consented leave resolves through the authoritative abandon path
- elimination and match-finish consequences are reflected in room state
- required explicit events still emit correctly

### Path 5 - Idle Timeout Progression

Must verify:

- `await_roll` can auto-roll
- `await_optional_action` can auto-skip purchase
- `await_end_turn` can auto-advance the turn
- idle timeout does not progress while the active player is temporarily disconnected

### Path 6 - Completed Match Persistence

Must verify:

- finished rooms can persist `matches` and `match_players`
- finished rooms can persist `leaderboard_stats`
- persisted result data matches the authoritative finished-room snapshot

### Path 7 - Duplicate Finalize Idempotency

Must verify:

- persisting the same finished match twice does not duplicate rows
- leaderboard counters are not incremented more than once for the same `matchId`

### Path 8 - Persistence Failure Signaling

Must verify:

- current MVP behavior is explicit when persistence fails
- room runtime surfaces the failure through its persistence status markers
- gameplay truth is not rolled back just because the database write failed

## What Is Explicitly Not Required in Step 1

This step does not require:

- Playwright browser automation
- frontend pages or HUD implementation
- `LobbyRoom` feature expansion beyond what is needed for multiplayer confidence
- production-grade distributed failure simulation
- Redis-backed multi-instance verification

## Approved Testing Direction

For Phase 10, the recommended direction is:

- use automated test files close to `apps/game-server`
- prefer deterministic room harnesses over browser flows
- keep PostgreSQL integration tests targeted and cleanup-aware
- treat manual smoke scripts as fallback/debug tools, not the primary confidence mechanism

## Expected Result After Step 1

After this step:

- Phase 10 has a locked critical-path verification scope
- the project has a clear separation between engine-unit coverage and room/persistence integration coverage
- the next step can focus on harness setup instead of revisiting test priorities

