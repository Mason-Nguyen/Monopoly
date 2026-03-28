# Phase 3 - Step 2: TypeScript and Shared Types Scaffolding

## Objective

Scaffold the first concrete shared TypeScript contracts used by the workspace.

This step turns the modeling decisions from Phase 2 into reusable source files for:

- enums
- IDs
- room state interfaces
- board config interfaces
- command payload types
- event payload types

## Implemented Scope

The scaffolded shared-type foundation includes:

- room and match enums
- board and game enums
- error code enums
- shared ID aliases
- player and room state interfaces
- board config interfaces
- lobby and gameplay command payloads
- lobby and gameplay event payloads

## Files Added or Filled In

Within `packages/shared-types/src`:

- `enums/room.ts`
- `enums/board.ts`
- `enums/game.ts`
- `enums/errors.ts`
- `ids/index.ts`
- `common/primitives.ts`
- `common/player.ts`
- `common/state.ts`
- `board/config.ts`
- `commands/lobby.ts`
- `commands/game.ts`
- `events/lobby.ts`
- `events/game.ts`

Related index files were updated to export these modules.

## Key Decisions Reflected in Code

- string-literal unions are used for shared enums
- state interfaces stay transport-friendly and framework-agnostic
- command payloads stay minimal and identifier-based
- event payloads remain summary-oriented and non-authoritative
- board config stays separated from dynamic ownership state

## Notes

- This step creates shared contracts only; it does not yet scaffold runtime libraries such as React, NestJS, or Colyseus packages.
- Colyseus schema classes are deferred to Phase 3 Step 4.
- Board config data values are deferred to Phase 3 Step 3.

## Exit Criteria

Step 2 is complete when:

- shared contracts can be imported from `@monopoly/shared-types`
- enums and payload shapes match Phase 2 documents
- later scaffolding steps can build on these types without redefining contracts