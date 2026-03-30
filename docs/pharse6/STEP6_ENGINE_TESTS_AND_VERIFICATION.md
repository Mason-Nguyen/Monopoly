# Phase 6 - Step 6: Engine Tests and Verification

## Objective

Add an initial automated test suite for the pure game engine so the implemented MVP rules can be verified repeatedly without relying on manual smoke scripts.

This step converts the most important Step 3, Step 4, and Step 5 gameplay flows into executable regression tests.

## Implemented Scope

The Step 6 implementation includes:

- a baseline automated test runner for `packages/game-engine`
- reusable test fixtures for deterministic match setup
- automated tests for movement, economy, jail, bankruptcy, and match-end flows
- a root convenience script to rerun the game-engine test suite after rebuilding the shared packages it depends on

## Files Added or Updated

### Root Workspace

- `package.json`

### `packages/game-engine`

- `package.json`
- `tests/support/fixtures.ts`
- `tests/movement-and-economy.test.ts`
- `tests/jail-and-bankruptcy.test.ts`

## Test Runner Strategy

This step uses the built-in Node test runner with `tsx`:

- no additional dedicated test framework was required for the initial engine baseline
- tests run against the package boundary through `@monopoly/game-engine` and `@monopoly/shared-config`
- the root script rebuilds the relevant shared packages before executing the engine tests

Commands added:

- root: `npm run test:game-engine`
- package: `npm run test --workspace @monopoly/game-engine`

## Covered Rule Flows

### Movement and Economy Tests

The suite now verifies:

- initial match state creation
- wraparound movement and `startSalary`
- optional purchase availability on unowned property
- successful property purchase
- automatic rent payment
- automatic tax payment
- `go_to_jail` forced movement and jail-state activation

### Jail and Bankruptcy Tests

The suite now verifies:

- bankruptcy after tax when balance is insufficient
- bankruptcy after rent when balance is insufficient
- property release back to the bank after elimination
- winner detection when only one active player remains
- jailed-player skip and automatic release after one skipped turn

## Verification Performed

The following checks were completed for Step 6:

- `npm run typecheck --workspace @monopoly/game-engine`
- `npm run build --workspace @monopoly/game-engine`
- `npm run test --workspace @monopoly/game-engine`
- `npm run typecheck`
- `npm run build`
- `npm run test:game-engine`

## Notes

- the current test suite is intentionally focused on deterministic rule regression, not network or Colyseus integration
- these tests give Phase 7 a safer base for wiring the engine into room handlers
- broader coverage such as abandonment-driven elimination can be added later once room integration begins
