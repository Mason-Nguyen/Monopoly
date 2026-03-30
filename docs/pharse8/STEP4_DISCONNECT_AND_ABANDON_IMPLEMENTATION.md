# Phase 8 - Step 4: Disconnect and Abandon Implementation

## Objective

Implement the authoritative abandon path for live `MonopolyRoom` lifecycle outcomes so reconnect expiry and consented leave no longer remain as schema-only mutations.

This step turns the Phase 8 Step 3 strategy into working code.

## What This Step Implements

Step 4 adds two connected implementation layers:

- a pure engine lifecycle transition for player abandonment
- a room-side lifecycle service that uses that transition when live room events become competitive outcomes

## Implemented Files

### Game Engine

- `packages/game-engine/src/types/lifecycle.ts`
- `packages/game-engine/src/types/index.ts`
- `packages/game-engine/src/rules/lifecycle.ts`
- `packages/game-engine/src/rules/index.ts`
- `packages/game-engine/tests/lifecycle.test.ts`
- `packages/game-engine/package.json`

### Game Server

- `apps/game-server/src/services/engine-lifecycle-execution.ts`
- `apps/game-server/src/services/room-lifecycle.ts`
- `apps/game-server/src/services/gameplay-event-broadcast.ts`
- `apps/game-server/src/services/index.ts`
- `apps/game-server/src/rooms/MonopolyRoom.ts`

## Engine Lifecycle Transition

A new pure lifecycle transition entry point now exists in the engine:

```ts
applyEngineLifecycleOutcome({
  state,
  boardConfig,
  outcome: {
    type: "abandon_player",
    playerId,
    reason: "abandoned"
  },
  now
})
```

This transition is separate from normal gameplay commands and is intentionally server-originated.

### Behavior Implemented

For `abandon_player`, the engine now:

- resolves the player as eliminated with reason `abandoned`
- releases all owned properties back to the bank
- advances turn if the abandoned player was active
- ends the match if only one active player remains
- returns the same structured transition result shape used by gameplay actions

### Idempotent Behavior

If the targeted player is already eliminated (`bankrupt` or `abandoned`), the lifecycle transition returns a no-op result rather than re-eliminating them.

This supports safer room-side lifecycle handling when duplicate triggers occur.

## Room Lifecycle Service

A new room-side lifecycle service now coordinates authoritative abandon handling.

Main helpers:

- `reservePlayerReconnectSlot(...)`
- `markPlayerReconnected(...)`
- `resolvePlayerAbandonment(...)`

### `reservePlayerReconnectSlot(...)`

Used when a player drops connection.

Behavior:

- sets `connection.status = disconnected_reserved`
- sets reconnect deadline
- keeps gameplay state untouched
- emits `game:playerConnectionChanged`

### `markPlayerReconnected(...)`

Used when a player successfully returns.

Behavior:

- sets `connection.status = reconnected`
- clears reconnect deadline
- emits `game:playerConnectionChanged`

### `resolvePlayerAbandonment(...)`

Used when reconnect expires or a player leaves a live match intentionally.

Behavior:

- if the match is still `playing` and the player is still competitively active:
  - executes authoritative engine lifecycle resolution
  - projects engine state back into schema
  - marks connection state as `abandoned`
  - emits `game:playerConnectionChanged`
  - emits engine-derived gameplay broadcasts such as `game:playerEliminated` and `game:resultReady`
- otherwise:
  - updates only connection UX state without reopening gameplay resolution

## `MonopolyRoom` Changes

### `onJoin()`

`MonopolyRoom` join behavior is now stricter for active matches.

Implemented behavior:

- rejects mismatched `matchId`
- rejects unknown players for seeded active matches
- rejects reclaim attempts for `abandoned` seats
- rejects duplicate control attempts when a seat is already `connected` or `reconnected`
- rejects reconnect attempts after the reconnect deadline has already expired
- still preserves a narrow dev-bootstrap fallback when the room has no seeded players

This closes the gap from Phase 8 Step 2 where the room could still create brand-new players ad hoc during a live match.

### `onDrop()`

`onDrop()` now:

- reserves the seat through the shared room lifecycle helper
- keeps the reconnect window behavior
- resolves reconnect expiry through the authoritative abandon path instead of directly mutating `isAbandoned`

### `onReconnect()`

`onReconnect()` now delegates to the shared lifecycle helper for reconnect status restoration and UX event emission.

### `onLeave()`

`onLeave()` now routes consented live-match leave through the same authoritative abandon path used by reconnect expiry.

This unifies the two permanent-leave outcomes as approved in Phase 8 Step 3.

## Metadata and Broadcast Alignment

The room metadata sync helper is now exported so lifecycle handling can refresh:

- `roomKind`
- `status`
- `playerCount`

This keeps room metadata aligned whether a transition comes from:

- gameplay commands
- lifecycle outcomes

## Tests Added

A new engine lifecycle test file now verifies:

- abandoning a non-active player releases their properties without changing the current turn
- abandoning the active player advances the turn authoritatively
- abandonment can end the match when only one active player remains

## Expected Result After Step 4

After this step:

- reconnect expiry and consented leave no longer rely on schema-only abandonment mutation during active matches
- room lifecycle outcomes can now produce authoritative elimination and match-end results through the engine
- seat reclaim rules in `MonopolyRoom` are tighter and closer to the approved MVP reconnect model
- the project is ready to continue with idle timeout handling in Step 5
