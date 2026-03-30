# Phase 7 - Step 6: Verification and Runtime Notes

## Objective

Verify that the live Colyseus room integration now runs authoritative gameplay transitions through the pure engine, and document the runtime caveats that remain intentionally deferred before Phase 7 sign-off.

## Verification Summary

Step 6 verifies Phase 7 integration at three levels:

- workspace health
- engine health
- local room integration behavior through compiled handler-path smoke checks

## Verified Commands and Results

### Workspace Health

The following commands were verified successfully after Step 5 integration changes:

- `npm run typecheck`
- `npm run build`

Result:

- all workspaces typecheck clean
- all workspaces build clean
- `apps/web` build still succeeds after game-server and shared contract changes

### Engine Health

The game engine suite was rerun successfully:

- `npm run test:game-engine`

Result:

- `10` tests passed
- movement, economy, jail, bankruptcy, and match-end rules remain stable after room integration changes

### Local Room Integration Behavior

The following room-level behaviors were verified using compiled JavaScript artifacts from `apps/game-server/dist/...`.

#### Verified: Match Initialization

Confirmed that `initializeMonopolyRoomState()` creates an engine-backed room state with:

- classic board config
- ordered turn order
- starting balance `1500`
- correct initial active player
- seeded players marked `disconnected_reserved` until real join occurs

#### Verified: Happy Path Gameplay Command Flow

Confirmed the handler-path flow:

- `game:rollDice`
- `game:buyProperty`
- `game:endTurn`

Result:

- commands executed through the engine
- schema state updated correctly
- gameplay broadcasts emitted in the expected order
- final active player advanced correctly

Observed event order for the property-purchase flow:

- `game:diceRolled`
- `game:playerMoved`
- `game:paymentApplied` for `start_salary`
- `game:tileResolved`
- `game:paymentApplied` for `property_purchase`
- `game:propertyPurchased`

Observed final state:

- `activePlayerId = p2`
- `turnNumber = 2`
- `mediterranean_avenue.ownerPlayerId = p1`
- `p1.balance = 1640`

#### Verified: Elimination and Match Result Flow

Confirmed a handler-path flow where the active player lands on `Luxury Tax` with insufficient balance.

Result:

- the engine emits bankruptcy outcome
- room schema moves to `finished`
- room broadcasts:
  - `game:diceRolled`
  - `game:playerMoved`
  - `game:tileResolved`
  - `game:playerEliminated`
  - `game:resultReady`
- result payload and schema result both point to the same winner and end reason

#### Verified: Invalid Gameplay Command Rejection

Confirmed that a non-active player sending `game:rollDice` is rejected correctly.

Result:

- client receives `game:error`
- error code is `NOT_ACTIVE_PLAYER`
- no success gameplay broadcasts are emitted
- room state remains unchanged

This confirms that runtime orchestration preserves engine authority and avoids partial state mutation on rejected commands.

## Runtime Notes

### State and Events Are Now Properly Split

Current behavior is aligned with the approved Phase 2 model:

- synchronized room state remains authoritative
- explicit `game:*` events are emitted only as UX helpers
- clients can rebuild the correct room UI from synchronized state alone

### Current Explicit Broadcast Coverage

The room now emits these gameplay UX events after successful transitions:

- `game:diceRolled`
- `game:playerMoved`
- `game:tileResolved`
- `game:paymentApplied`
- `game:propertyPurchased`
- `game:playerEliminated`
- `game:resultReady`

These engine events remain state-driven only:

- `turn_advanced`
- `jail_state_changed`

This is intentional for the current implementation wave.

## Deferred Runtime Caveats

The following items remain intentionally deferred after Step 6:

- no automated Colyseus integration tests with real clients are in place yet; current verification uses compiled handler-path smoke checks
- disconnect and abandonment lifecycle still mutates room/schema state directly in `MonopolyRoom`; it is not yet translated into engine-level elimination and match-end handling
- match result persistence into PostgreSQL is still not wired from live room completion
- lobby-to-match transfer is still a baseline flow, not a fully hardened production matchmaking pipeline
- `turn_advanced` and `jail_state_changed` are not emitted as explicit UX events; the frontend must currently read these from synchronized room state
- chance, community chest, mortgage, trade, houses, and hotels remain outside the MVP engine and room integration scope
- unexpected non-rule runtime exceptions in gameplay handlers are still allowed to bubble instead of being translated into a sanitized gameplay error event

## Environment Notes

In this Windows environment, some verification commands required unsandboxed execution because process spawning was blocked by sandbox policy:

- `npm run build` for the Vite web build
- `npm run test:game-engine` for Node test runner process spawning

This is an environment verification caveat, not an application runtime bug.

## Step 6 Outcome

Step 6 is complete when:

- room integration has been re-verified after Step 5
- workspace typecheck, build, and engine tests are clean
- the remaining runtime gaps are explicitly documented

The project now has enough verified room integration baseline to proceed to Phase 7 sign-off.
