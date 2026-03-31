# Phase 10 - Step 2: Room Test Harness and Runtime Boundaries

## Objective

Define and scaffold the baseline harness utilities for room-level integration tests so later steps can focus on test cases instead of re-building the same runtime helpers repeatedly.

This step establishes the testing boundary and adds the first reusable support files for `apps/game-server` integration tests.

## What This Step Adds

Step 2 introduces two things:

- the approved runtime boundary for room-driven multiplayer tests
- a reusable test-support baseline inside `apps/game-server/tests/support`

This is still intentionally lighter than full end-to-end test coverage.

The goal is to make Step 3 and Step 4 implementation faster and more consistent.

## Approved Test Harness Direction

For Phase 10, room tests should be written close to `apps/game-server` and should validate multiplayer runtime behavior without involving the frontend.

Primary harness direction:

- test from the game-server layer
- use deterministic room setup
- use mock clients and broadcast capture helpers
- keep assertions centered on authoritative room state and emitted events

Approved fallback note:

- if source-level room execution becomes unstable on this Windows environment because of decorator or sandbox behavior, tests may run through compiled output as a runtime fallback
- this does not change the verification target; it only changes the local execution path

## Runtime Boundaries Chosen in Step 2

### What Should Stay Real in Room Tests

The following should stay as real as practical:

- `MonopolyRoom` logic
- engine-backed command execution
- room lifecycle services
- explicit gameplay event broadcasting
- persistence services for persistence-focused tests

### What Can Be Mocked or Faked

The following can be mocked or faked safely:

- Colyseus clients
- room broadcast observation
- timer cleanup coordination around test setup and teardown
- persistence preconditions such as seeded room metadata or seeded join options

### What Is Still Deferred

The following are intentionally deferred after Step 2:

- browser transport realism
- Playwright or frontend-driven multiplayer tests
- Redis-backed distributed runtime verification
- production deployment concerns

## Support Files Added

The following baseline support files were added in this step:

- `apps/game-server/tests/support/contracts.ts`
- `apps/game-server/tests/support/clients.ts`
- `apps/game-server/tests/support/broadcasts.ts`
- `apps/game-server/tests/support/cleanup.ts`
- `apps/game-server/tests/support/index.ts`
- `apps/game-server/tsconfig.tests.json`

## Purpose of Each Support File

### `contracts.ts`

Defines the basic test-only contracts for:

- mock client shape
- broadcast records
- broadcast-capable room expectations
- seeded join-option inputs

### `clients.ts`

Provides deterministic helpers for:

- creating mock Colyseus-like clients
- creating seeded match join options
- resetting the synthetic session-id counter between tests when needed

### `broadcasts.ts`

Provides helpers for:

- attaching a broadcast recorder to a room-like object
- collecting emitted room events for assertions
- restoring the original broadcast function after each test

### `cleanup.ts`

Provides a tiny cleanup stack so later room tests can register teardown callbacks without scattering cleanup logic across each test body.

### `tsconfig.tests.json`

Adds a dedicated TypeScript config for test-support code so test utilities can be typechecked without forcing test files into the main production build.

## Package Script Update

`apps/game-server/package.json` now includes:

- `typecheck:tests`

Purpose:

- verify the new test-support files compile cleanly
- keep test-only typing separate from the main production build flow

## What Step 2 Does Not Yet Implement

Step 2 does not yet add the real gameplay/lifecycle test cases.

Those belong in Step 3, where the project will begin using this harness baseline to assert:

- gameplay happy path
- invalid command rejection
- reconnect and abandonment flows
- idle timeout progression

## Expected Result After Step 2

After this step:

- Phase 10 has an approved room-test runtime boundary
- reusable support utilities exist for mock clients, event capture, and cleanup handling
- the project is ready to start writing actual room integration tests in Step 3
