# Phase 8 - Step 5: Idle Timeout and Turn Deadline Baseline

## Objective

Implement the MVP idle-turn baseline so a connected but inactive player can no longer block the match forever during input phases.

This step keeps timeout orchestration in the room layer while preserving authoritative gameplay transitions in the engine.

## What This Step Adds

Step 5 introduces:

- a room-side idle-turn scheduler tied to Colyseus room clock
- automatic timeout resolution for the approved MVP input phases
- a server-only engine action for declining the optional property purchase step
- timer resynchronization after gameplay transitions, reconnect changes, and lifecycle outcomes

## Implemented Files

### Game Engine

- `packages/game-engine/src/types/actions.ts`
- `packages/game-engine/src/rules/available-actions.ts`
- `packages/game-engine/src/rules/transition.ts`
- `packages/game-engine/tests/movement-and-economy.test.ts`

### Game Server

- `apps/game-server/src/services/idle-turn.ts`
- `apps/game-server/src/services/index.ts`
- `apps/game-server/src/services/room-lifecycle.ts`
- `apps/game-server/src/handlers/game.ts`
- `apps/game-server/src/rooms/MonopolyRoom.ts`

## MVP Timeout Rules Implemented

The room now applies the approved timeout rules from Phase 1:

- `await_roll` -> auto-roll dice
- `await_optional_action` -> auto-decline purchase and move to `await_end_turn`
- `await_end_turn` -> auto-end turn

The timeout only applies when the active player is:

- still in a `playing` match
- still the current active player
- in an input phase
- `connected` or `reconnected`
- not already eliminated

If the active player is temporarily disconnected, the idle timer is not allowed to progress their turn.

## Server-Only Engine Action

A new server-only engine action now exists:

```ts
{
  type: "skip_optional_action",
  actingPlayerId
}
```

Purpose:

- move from `await_optional_action` to `await_end_turn`
- keep optional-purchase decline as a pure authoritative transition
- avoid direct room mutation for the timeout path

This is not a new client command.

It is only used by the room's timeout orchestration.

## Idle Timer Service

A new room service now owns idle-turn scheduling:

- `syncIdleTurnTimeout(room)`
- `cancelIdleTurnTimeout(room)`

### `syncIdleTurnTimeout(room)`

Behavior:

- clears any previous timer
- inspects current room state
- schedules a new timeout only if the active player is eligible for idle handling
- captures `playerId`, `turnPhase`, and `turnNumber` so stale timers do not resolve the wrong turn later

### Timeout Safety

When the timer fires, it first verifies that the captured context still matches:

- same active player
- same phase
- same turn number
- match still playing

If the context is stale, it does nothing except resync the timer.

## Room Integration Changes

### Gameplay Commands

After a successful gameplay command, the room now resynchronizes the idle timer.

This ensures the timeout always follows the latest authoritative state after:

- roll dice
- buy property
- end turn

### Lifecycle Changes

The room now also resynchronizes the idle timer after:

- disconnect reservation
- reconnect success
- authoritative abandonment resolution
- successful live join into the room

This keeps timeout ownership aligned with current active input responsibility.

### `MonopolyRoom` State

`MonopolyRoom` now stores lightweight timer tracking fields:

- `idleTurnTimeout`
- `idleTurnTimeoutContext`

These are runtime-only concerns and are intentionally not part of synchronized schema state.

## Explicitly Not Added Yet

Step 5 does not add a dedicated `game:idleTimeout` event.

Current behavior is:

- clients observe the resulting authoritative state changes
- clients also receive the normal gameplay events caused by auto-actions, such as `game:diceRolled`, `game:playerMoved`, or `game:resultReady`

For `skip_optional_action`, there is currently no dedicated explicit event. The client is expected to observe the synchronized turn-phase change.

## Expected Result After Step 5

After this step:

- connected idle players no longer stall the match indefinitely
- temporary disconnects still pause active-player input instead of triggering idle auto-resolution
- room timers remain runtime-only while engine transitions remain authoritative
- the project is ready for Step 6 verification across disconnect, reconnect, abandon, and idle scenarios
