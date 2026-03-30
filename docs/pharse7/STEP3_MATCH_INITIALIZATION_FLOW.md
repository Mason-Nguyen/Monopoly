# Phase 7 - Step 3: Match Initialization Flow

## Objective

Move active-match room startup onto an engine-authoritative initialization path so `MonopolyRoom` begins from the same deterministic rule baseline that Phase 6 already tested.

This step ensures the room no longer invents its own gameplay starting state independently from the pure engine.

## Why Step 3 Matters

Before this step, the active match room could create a playable-looking schema state directly from factory defaults.

That was enough for scaffolding, but it left an important risk:

- room startup could drift away from the engine's real starting assumptions for balances, turn order, jail state, and ownership

Phase 7 should avoid that divergence before gameplay commands are wired through the engine.

## Recommended Initialization Flow

The approved initialization flow for `MonopolyRoom` is now:

1. room receives `MonopolyRoomCreateOptions`
2. room startup resolves `matchId` and `startedAt`
3. room startup converts `PlayerIdentity[]` into engine player setup order
4. room startup calls `createInitialMatchState()` from `packages/game-engine`
5. room startup creates the static Colyseus schema shell for board and room metadata
6. room startup applies the engine-created initial state back into schema state through the projection helper
7. room preserves room-owned connection state separately from gameplay state

This means the engine is now the source of truth for match initialization whenever player identities are provided.

## Implementation Baseline Added

### New Service

Step 3 adds a room-integration helper at:

- `apps/game-server/src/services/match-initialization.ts`

The helper now provides:

- `initializeMonopolyRoomState(options)`

Its responsibilities are:

- resolve `matchId`
- resolve `startedAt`
- convert room players into engine player setup
- call `createInitialMatchState()` using `CLASSIC_BOARD_CONFIG`
- apply engine state into Colyseus schema state
- mark seeded room players as `disconnected_reserved` until they actually join the room transport

### Schema Factory Support

Step 3 also adds a lower-level schema initializer:

- `createEmptyMonopolyRoomState(options)`

This keeps static board and room-shell setup inside schema factories while leaving engine-backed gameplay initialization in the service layer.

## `MonopolyRoom` Update

`apps/game-server/src/rooms/MonopolyRoom.ts` now uses the new initialization service during `onCreate()` instead of building active gameplay state directly through the old schema-only path.

This means:

- room startup is engine-backed when players are provided
- turn owner, balances, and starting gameplay state now align with Phase 6 engine behavior
- player connection status remains a room concern and is updated during `onJoin()`

## Exact Mapping Decisions Locked In

### Player Order

The order of `options.players` is now treated as authoritative room-start order for Step 3.

The initialization helper converts that array into engine `turnOrder` values using `index + 1`.

### Starting Balances and Positions

These no longer come from room-only defaults during the engine-backed path.

They come from the engine's initial match creation rules.

### Connection State During Transfer

When the room is created with seeded players:

- gameplay state is initialized immediately
- player slots exist immediately
- each seeded player's room connection state starts as `disconnected_reserved`
- the status flips to `connected` during the real `onJoin()` transport hook

This keeps transport state honest while still allowing the match room to be created before every player has joined.

## Important Current Limitation

Step 3 initializes room state through the engine, but it does not yet execute gameplay commands through the engine.

That still belongs to the next steps.

Also, if `MonopolyRoom` is created with no players, the initialization helper currently falls back to an empty room shell for development safety.

The real production-intended path is still the seeded-player initialization flow.

## Verification

The following checks were completed for Step 3:

- `npm run typecheck --workspace @monopoly/game-server`
- `npm run build --workspace @monopoly/game-server`
- `npm run typecheck`
- `npm run build`
- a compiled-JS smoke check for `initializeMonopolyRoomState()` using four seeded players

The smoke check verified:

- the room starts with four seeded player slots
- the first active player is the first seeded player
- starting balances are engine-backed
- seeded players begin in `disconnected_reserved`
- connection status changes remain separate from gameplay projection concerns

## Immediate Next Design Target

With room startup now aligned to engine initialization, the next step should replace placeholder gameplay message handling with a real command execution pipeline that calls `applyEngineAction()`.
