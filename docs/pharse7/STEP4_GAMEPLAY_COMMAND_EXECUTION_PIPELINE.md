# Phase 7 - Step 4: Gameplay Command Execution Pipeline

## Objective

Replace placeholder gameplay mutations in `apps/game-server/src/handlers/game.ts` with a real engine-backed command execution path.

This step makes `MonopolyRoom` use the pure gameplay engine for authoritative command resolution instead of mutating turn state ad hoc inside the room handler.

## Why Step 4 Matters

Before this step:

- `roll_dice` used local room mutation and `Math.random()` directly in the handler
- `buy_property` was still a placeholder error
- `end_turn` manually advanced room turn state outside the engine

That meant the room layer still duplicated gameplay logic even after Phase 6 completed.

Step 4 removes that duplication.

## Command Pipeline Added

The approved gameplay command pipeline is now implemented as:

1. receive client message in `createGameMessageHandlers()`
2. validate that the client maps to a registered room player
3. validate payload shape when required
4. build the corresponding engine action
5. call the room execution helper
6. project the resulting engine state back into Colyseus schema state
7. rely on normal room patching for synchronized client updates

At this step, explicit gameplay event broadcasts are still intentionally deferred to Step 5.

## Implementation Baseline Added

### New Service

Step 4 adds:

- `apps/game-server/src/services/engine-command-execution.ts`

This helper now owns the runtime command execution bridge between:

- `MonopolyRoomStateSchema`
- `projectMonopolyRoomStateToEngineState()`
- `applyEngineAction()`
- `applyEngineStateToMonopolyRoomState()`

The helper currently:

- reconstructs engine state from room schema
- injects runtime dice through a room-side dice source
- applies the engine transition
- writes the resulting engine state back into synchronized schema state
- returns the raw engine transition result for later Step 5 broadcast mapping

### Handler Update

`apps/game-server/src/handlers/game.ts` now translates room commands into engine actions for:

- `game:rollDice`
- `game:buyProperty`
- `game:endTurn`

The handler keeps only room-level concerns:

- resolve player identity from the client session
- ensure the sender belongs to the room
- validate payload shape
- catch and translate `EngineRuleError` into `game:error`

## Error Mapping Baseline

For Step 4, handler error translation now maps common engine rule failures into the existing shared game error codes such as:

- `NOT_ACTIVE_PLAYER`
- `INVALID_TURN_PHASE`
- `PROPERTY_NOT_BUYABLE`
- `INSUFFICIENT_FUNDS`
- `MATCH_NOT_PLAYING`
- `PLAYER_ELIMINATED`
- `INVALID_PAYLOAD`

This keeps the command pipeline useful before richer event mapping is added.

## Important Current Limitation

Step 4 does not yet broadcast explicit gameplay events derived from engine transition events.

At this stage:

- authoritative gameplay state is updated correctly through schema patches
- clients can observe room-state changes
- explicit UX event broadcasts such as dice, payment, tile summary, elimination, and result-ready still belong to Step 5

## Verification

The following checks should be completed for Step 4:

- `npm run typecheck --workspace @monopoly/game-server`
- `npm run build --workspace @monopoly/game-server`
- a compiled-JS smoke check for engine-backed `roll_dice`, `buy_property`, and `end_turn`
- `npm run typecheck`
- `npm run build`

## Immediate Next Design Target

With engine-backed command execution now in place, the next step should map the engine transition events into Colyseus room broadcasts so the multiplayer runtime can drive richer client UX feedback and animation triggers.
