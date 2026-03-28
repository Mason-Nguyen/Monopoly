# Phase 3 - Step 3: Board Config and Static Game Data Scaffolding

## Objective

Scaffold the static game data foundation used across the workspace, with the classic 40-tile board as the primary MVP configuration.

This step turns the Phase 2 board model into reusable source code inside `packages/shared-config`.

## Implemented Scope

The scaffolded static data foundation includes:

- MVP gameplay constants
- classic 40-tile board config
- property definitions for the MVP board
- board validation helpers
- simple lookup helpers for tile and property config

## Files Added or Filled In

Within `packages/shared-config/src`:

- `constants/game.ts`
- `constants/index.ts`
- `board/classic-board.ts`
- `board/validate-board-config.ts`
- `board/index.ts`

The package manifest was updated to depend on `@monopoly/shared-types`.

## Key Decisions Reflected in Code

- the board remains classic with exactly 40 tiles
- unsupported classic special spaces are currently represented as `neutral`
- taxes remain explicit fixed-value tiles
- true ownership-ready properties are modeled as `property`
- static board config is separated from dynamic ownership state
- the board config validates itself at module load time

## Notes

- This step scaffolds static game data only; dynamic ownership still belongs to room state.
- The current classic board mapping keeps railroads, utilities, chance, and community chest out of MVP gameplay behavior.
- If later you want to rebalance the MVP, those tiles can be remapped without changing the room-state model.

## Exit Criteria

Step 3 is complete when:

- `@monopoly/shared-config` exposes a usable classic board config
- static board data can be reused by frontend and game server
- board validation rules are encoded in code rather than only docs
- later room initialization can consume the board config directly