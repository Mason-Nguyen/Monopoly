# Phase 7 - Step 2: Engine State to Colyseus Schema Mapping Strategy

## Objective

Define how `EngineMatchState` and `MonopolyRoomStateSchema` map to each other so the room layer can execute engine transitions without re-implementing gameplay rules.

This step locks the projection strategy before real command integration begins.

## Why Mapping Is Needed

The project now has two different but valid state shapes:

- `EngineMatchState` in `packages/game-engine`
- `MonopolyRoomStateSchema` in `apps/game-server/src/schemas`

They exist for different reasons.

The engine state is optimized for deterministic rule execution.

The Colyseus schema state is optimized for synchronized live multiplayer state.

The room layer needs a predictable way to move between them.

## Recommended Mapping Direction

Use a two-way integration strategy with different responsibilities for each direction.

### Room Schema -> Engine State

Use this direction immediately before executing a gameplay command.

Purpose:

- reconstruct an authoritative engine snapshot from the current live room state
- preserve the room as the source of truth that clients are already synchronized to
- avoid storing a second long-lived gameplay state copy inside the room runtime unless later proven necessary

### Engine State -> Room Schema

Use this direction immediately after a successful engine transition.

Purpose:

- apply the authoritative gameplay result back into synchronized Colyseus schema state
- let the next room patch reflect the engine decision cleanly
- keep event broadcasts aligned with the same authoritative result

## Projection Rule

For the current implementation wave, projection should be treated as:

- ephemeral room-to-engine snapshot reconstruction before command execution
- full dynamic-slice sync from engine back into room state after command execution

This is safer than mixing partial ad-hoc field updates during the first integration wave.

## Static vs Dynamic State Mapping

### Static Board Data

Board tiles and property definitions are already created from shared board config.

These should remain mostly static inside the room schema.

Do not rebuild the whole board structure after every engine transition.

Only update the dynamic parts that actually change, especially:

- property ownership
- match metadata
- player runtime state
- turn state
- final result state

### Dynamic Runtime Data

The following slices should be projected on every successful engine transition:

- `status`
- `finishedAt`
- `players`
- `board.properties[*].ownerPlayerId`
- `turn`
- `result`

## Exact Mapping Decisions

### Players

#### Schema -> Engine

From `MatchPlayerStateSchema`, the room should project:

- `playerId`
- `displayName`
- `turnOrder`
- `position`
- `balance`
- `isBankrupt`
- `isAbandoned`
- `jail`

Additionally, `ownedPropertyIds` should be derived from `board.properties` ownership data instead of stored directly in schema.

`eliminationReason` should be derived as:

- `bankrupt` if `isBankrupt = true`
- `abandoned` if `isAbandoned = true`
- `null` otherwise

#### Engine -> Schema

From `EnginePlayerState`, the room should sync back:

- `displayName`
- `turnOrder`
- `position`
- `balance`
- `isBankrupt`
- `isAbandoned`
- `jail.isInJail`
- `jail.turnsRemaining`

Connection data must be preserved from the room side because the engine does not own transport state.

### Property Ownership

#### Schema -> Engine

Map every `board.properties[propertyId].ownerPlayerId` into `propertyOwners[propertyId].ownerPlayerId`, converting empty string to `null`.

#### Engine -> Schema

Map every `propertyOwners[propertyId].ownerPlayerId` back into `board.properties[propertyId].ownerPlayerId`, converting `null` to empty string.

### Turn State

#### Schema -> Engine

Map:

- `turnNumber`
- `activePlayerId`
- `phase`
- `canBuyCurrentProperty`
- `awaitingInput`

Conversion rules:

- if dice values are all `0`, project `dice = null`
- if `currentTileIndex = -1`, project `currentTileIndex = null`

#### Engine -> Schema

Map the same fields back.

Conversion rules:

- if engine dice is `null`, write `diceTotal = 0`, `diceValueA = 0`, `diceValueB = 0`
- if engine `currentTileIndex = null`, write `currentTileIndex = -1`

### Match Result

#### Schema -> Engine

Treat result as `null` unless the room has a non-empty `winnerPlayerId` and a positive `finishedAt`.

#### Engine -> Schema

If engine result is `null`, clear the room result object to:

- `winnerPlayerId = ""`
- `endReason = ""`
- `finishedAt = 0`

Otherwise map the real result fields directly.

## Mapping Location

For the first integration wave, projection helpers should live in:

- `apps/game-server/src/services/engine-state-projection.ts`

Reason:

- the logic belongs to runtime orchestration, not the pure engine
- it is reusable by handlers, room classes, and later verification utilities
- it keeps schema-specific code out of `packages/game-engine`

## Baseline Helper Contract

The baseline helper layer for this step uses:

- `projectMonopolyRoomStateToEngineState(roomState)`
- `applyEngineStateToMonopolyRoomState(roomState, engineState)`

This is intentionally enough for the next step without prematurely adding command orchestration or event broadcasting concerns.

## Implementation Baseline Added

This step now includes a baseline projection helper at:

- `apps/game-server/src/services/engine-state-projection.ts`

The helper currently supports:

- reconstructing engine players from schema players and property ownership
- deriving engine turn order from schema player ordering
- converting schema sentinel values into engine `null` values
- applying engine player, ownership, turn, status, and result slices back into schema state
- preserving room-owned connection state while syncing gameplay fields

## Important Current Limitation

Step 2 defines and scaffolds state projection only.

It does not yet:

- initialize a live room from engine state during room creation
- execute gameplay commands through the engine
- broadcast engine events through Colyseus

Those behaviors belong to the next steps.

## Immediate Next Design Target

With the mapping baseline in place, the next step should wire room creation into `createInitialMatchState()` so the live room starts from an engine-authoritative initialization path instead of schema-only defaults.

## Verification

The following checks were completed for Step 2:

- `npm run typecheck --workspace @monopoly/game-server`
- `npm run build --workspace @monopoly/game-server`
- `npm run typecheck`
- `npm run build`
- a compiled-JS roundtrip smoke check for `projectMonopolyRoomStateToEngineState()` and `applyEngineStateToMonopolyRoomState()`

The roundtrip smoke check verified:

- schema property ownership projects into engine `ownedPropertyIds`
- engine balance and property-owner updates apply back into room schema
- turn fields roundtrip correctly
- room-owned connection state is preserved during engine-to-schema sync
