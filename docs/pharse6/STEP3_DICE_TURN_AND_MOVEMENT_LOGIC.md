# Phase 6 - Step 3: Dice, Turn, and Movement Logic

## Objective

Implement the first real gameplay transitions in the pure game engine:

- initial match state creation
- dice resolution
- player movement
- start-salary handling
- turn advancement

This step creates the first deterministic gameplay slice that later tile and economy logic can build on.

## Implemented Scope

The Step 3 implementation includes:

- creation of an initial pure engine match state from board config and player setup
- deterministic dice resolution from injected dice values or a dice source
- board movement calculation for the classic looping board
- passing-start salary application
- active-player validation for engine actions
- end-turn advancement to the next non-eliminated player
- initial available-action calculation based on turn phase
- a top-level `applyEngineAction()` transition entry point for the implemented actions

## Files Added or Updated

### `packages/game-engine`

- `src/calculators/dice.ts`
- `src/calculators/movement.ts`
- `src/calculators/index.ts`
- `src/reducers/match-state.ts`
- `src/reducers/turn.ts`
- `src/reducers/index.ts`
- `src/rules/errors.ts`
- `src/rules/available-actions.ts`
- `src/rules/transition.ts`
- `src/rules/index.ts`
- `src/resolvers/index.ts`
- `src/types/results.ts`
- `package.json`

### `docs/pharse6`

- `STEP3_DICE_TURN_AND_MOVEMENT_LOGIC.md`

## Rule Behavior Added

### Initial Match State

The engine can now create a deterministic initial match state from:

- `matchId`
- `boardConfig`
- ordered player setup
- `startedAt`

Players start with:

- board position `0`
- balance equal to `boardConfig.startingMoney`
- no owned properties
- no jail time
- no elimination state

The first active player is the player with the lowest `turnOrder`.

### Dice Resolution

The engine now supports two deterministic dice paths:

- explicit dice values passed through the action
- an injected `diceSource`

The engine validates that die values stay within `1..6`.

### Movement and Start Salary

The engine now calculates movement by wrapping around `boardConfig.tileCount`.

When a move crosses or lands on `Start` by wrapping around the board, the engine:

- marks `passedStart: true`
- awards `boardConfig.startSalary`
- emits a `payment_applied` event with reason `start_salary`

### Turn Advancement

The engine now supports ending a turn from:

- `await_end_turn`
- `turn_complete`

Turn advancement skips players marked as bankrupt or abandoned and resets the next turn to:

- `phase = await_roll`
- `dice = null`
- `currentTileIndex = null`
- `awaitingInput = true`

## Important Current Limitation

Step 3 intentionally stops after movement and turn advancement.

After `roll_dice`, the engine now moves the active player and sets the turn phase to `resolving_tile`, but the deeper tile and economy effects are deferred to Step 4.

That means:

- `buy_property` is not implemented yet
- rent and tax resolution are not implemented yet
- jail and bankruptcy consequences beyond basic turn skipping are not implemented yet

## Packaging Note

The package root export for `@monopoly/game-engine` was aligned with the actual TypeScript build output so the engine can be imported and smoke-tested through the package boundary instead of only via local source paths.

## Verification

The following checks were completed during Step 3:

- `npm run typecheck --workspace @monopoly/game-engine`
- `npm run build --workspace @monopoly/game-engine`
- `npm run typecheck`
- `npm run build`
- a smoke test importing `@monopoly/game-engine` and `@monopoly/shared-config` through package resolution

The smoke test verified:

- initial match state creation
- wraparound movement from tile `38` to tile `2`
- start salary application from `1500` to `1700`
- `turn_advanced` transition from `p1` to `p2`

## Notes

- the current top-level engine transition entry is `applyEngineAction()`
- the engine now has enough movement and turn logic to support the next tile-resolution step cleanly
- the implementation keeps randomness injectable and does not rely on hidden global state

## Exit Criteria

Step 3 is complete when:

- the engine can create an initial match state
- the engine can resolve a dice roll into movement deterministically
- the engine can award start salary on board wraparound
- the engine can advance turns deterministically
- the workspace remains typecheck- and build-clean after the new rule logic is added
