# Phase 7 - Step 5: Engine Event Broadcast and Schema Sync

## Objective

Broadcast explicit gameplay events from authoritative engine transitions while keeping synchronized Colyseus schema state as the single source of truth.

This step builds on Step 4 by taking the `EngineTransitionResult` returned from gameplay commands and turning its event list into the approved `game:*` room events for client UX.

## What This Step Adds

- a room-side mapping layer from engine events to shared gameplay events
- broadcast integration after successful engine-backed commands
- metadata refresh after each authoritative gameplay transition
- clear separation between:
  - state-driven facts that clients should read from synchronized room state
  - UX-oriented notifications that clients can use for animation, feed, and toast behavior

## Implemented Files

- `apps/game-server/src/services/gameplay-event-broadcast.ts`
- `apps/game-server/src/handlers/game.ts`
- `apps/game-server/src/services/index.ts`
- `packages/shared-types/src/events/game.ts`

## Mapping Strategy

### Broadcasted Explicitly

The room now broadcasts these events after successful engine transitions:

- `game:diceRolled`
- `game:playerMoved`
- `game:tileResolved`
- `game:paymentApplied`
- `game:propertyPurchased`
- `game:playerEliminated`
- `game:resultReady`

### Kept State-Driven

These engine events remain implicit through synchronized room state and are not broadcast as separate UX events in this step:

- `turn_advanced`
- `jail_state_changed`

Reason:

- the frontend can derive current turn owner and jail status from synchronized state
- keeping these as state-driven avoids redundant transient messages while still preserving full authority in the room state

## Tile Resolution Mapping

`tile_resolved` engine events are translated to the existing shared payload:

```ts
{
  playerId: string;
  tileIndex: number;
  tileType: TileType;
  summaryCode: TileResolutionSummaryCode;
  message: string;
}
```

Current summary mapping:

- `start` -> `LANDED_ON_START`
- unowned `property` -> `PROPERTY_AVAILABLE`
- owned `property` by another player -> `PAID_RENT`
- `tax` -> `PAID_TAX`
- `go_to_jail` -> `WENT_TO_JAIL`
- all other outcomes -> `NO_EFFECT`

The human-readable `message` is generated from current room state plus engine event facts so the frontend can show feed/toast UI without diffing state by itself.

## Payment Payload Adjustment

`GamePaymentAppliedEvent` now allows bank-side payments by making `fromPlayerId` optional.

Reason:

- `start_salary` is paid from the bank to the player
- `property_purchase` and `tax` may also involve the bank as the counterparty
- the previous contract assumed `fromPlayerId` always existed, which did not match engine event reality

## Metadata Sync

After applying an engine transition, the room refreshes metadata from current schema state:

- `roomKind`
- `status`
- `playerCount`

This keeps room metadata aligned with authoritative state after gameplay transitions such as match completion.

## Verification Approach

This step should be verified by:

- workspace typecheck
- workspace build
- a handler-path smoke check that confirms explicit gameplay broadcasts appear in the expected order and with correct payloads

## Expected Result After Step 5

After this step:

- successful gameplay commands still mutate only through the engine
- schema state stays authoritative
- frontend clients can consume a clean stream of UX-oriented `game:*` events
- the codebase is ready for Step 6 runtime verification notes and caveats
