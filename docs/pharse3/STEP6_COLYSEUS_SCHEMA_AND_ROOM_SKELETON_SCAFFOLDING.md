# Phase 3 - Step 6: Colyseus Schema and Room Skeleton Scaffolding

## Objective

Map the approved Phase 2 room state model into real Colyseus schema classes and scaffold the baseline room classes for `LobbyRoom` and `MonopolyRoom`.

This step establishes the synchronized state structures and message registration points that later gameplay implementation will build on.

## Implemented Scope

The schema and room skeleton setup includes:

- Colyseus schema classes for lobby state
- Colyseus schema classes for match state
- schema factory helpers for creating initial room state
- lobby room skeleton with join, leave, ready, and host-start baseline behavior
- monopoly room skeleton with join, drop, reconnect, and leave lifecycle handling
- room message handler registration for lobby and gameplay commands
- game server room registration for `lobby` and `monopoly`
- TypeScript decorator setup required for `@colyseus/schema`
- Colyseus 0.17-aligned package versions and room typing

## Files Added or Updated

### `apps/game-server`

- `package.json`
- `tsconfig.json`
- `src/app.config.ts`
- `src/lib/room-ids.ts`
- `src/lib/index.ts`
- `src/schemas/lobby-state.ts`
- `src/schemas/monopoly-state.ts`
- `src/schemas/factories.ts`
- `src/schemas/index.ts`
- `src/handlers/lobby.ts`
- `src/handlers/game.ts`
- `src/handlers/index.ts`
- `src/rooms/LobbyRoom.ts`
- `src/rooms/MonopolyRoom.ts`
- `src/rooms/index.ts`

## Key Decisions Reflected in Code

- `MapSchema` is used for player and property dictionaries.
- `ArraySchema` is used for ordered tile data.
- schema classes use concrete default values so the synchronized state is always initialized.
- optional and nullable Phase 2 fields are represented with empty-string or sentinel-number defaults in the initial scaffold where necessary.
- lobby skeleton behavior is intentionally lightweight but real enough to support later end-to-end testing.
- match command handlers are registered now, while full game rules remain deferred to the game-engine implementation phases.
- package versions follow the Colyseus 0.17 migration guide, including `@colyseus/schema` 4.x.

## Notes

- `buyProperty` is still intentionally a placeholder command at this stage.
- the turn lifecycle is only partially scaffolded; Step 6 does not attempt to complete full Monopoly game logic.
- the room state classes are now aligned to the approved domain model, but later phases may still refine field-level details during integration.
- install and build verification still belongs to Phase 3 Step 7.

## Exit Criteria

Step 6 is complete when:

- `LobbyRoom` and `MonopolyRoom` exist as real Colyseus room classes
- synchronized room state is represented through `@colyseus/schema`
- room commands are registered against real handlers
- the game server knows how to expose both room types
- later gameplay implementation can build on top of a real room and state baseline