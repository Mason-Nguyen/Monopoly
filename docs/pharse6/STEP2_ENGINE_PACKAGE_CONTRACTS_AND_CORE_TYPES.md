# Phase 6 - Step 2: Engine Package Contracts and Core Types

## Objective

Define and scaffold the core package contracts for the pure game engine.

This step turns the Phase 6 purity boundary into concrete TypeScript types that later rule functions can implement against without pulling in Colyseus, Prisma, Fastify, or UI-layer concerns.

## Implemented Scope

The Step 2 implementation includes:

- engine action contracts
- engine dice and randomness contracts
- engine match, player, property-ownership, and turn state contracts
- engine transition input and output contracts
- engine event/effect contracts for later room integration
- initial match-creation input types for engine bootstrapping

## Files Added or Updated

### `packages/game-engine`

- `src/types/actions.ts`
- `src/types/state.ts`
- `src/types/results.ts`
- `src/types/index.ts`

### `docs/pharse6`

- `STEP2_ENGINE_PACKAGE_CONTRACTS_AND_CORE_TYPES.md`

## Contract Design Decisions

### Engine State Is Package-Oriented, Not Room-Oriented

The engine state types intentionally do not reuse the full room-state shape from earlier phases.

Instead, they model only the runtime data the pure rules need, such as:

- player balances and positions
- property ownership
- turn state
- jail state
- elimination state
- match result

This keeps the engine focused on rule execution rather than room transport concerns.

### Static Board Config Is Passed Separately

The engine transition input accepts `boardConfig` explicitly instead of embedding all board configuration directly into the engine state.

This keeps the state smaller and makes static configuration dependencies explicit at the rule boundary.

### Randomness Is Injectable

The engine contracts now include:

- `EngineDiceValues`
- `EngineDiceRoll`
- `EngineDiceSource`

This allows later rule implementations and tests to either inject fixed dice values or delegate dice generation outside the engine.

### Transition Results Are Structured for Later Colyseus Mapping

The engine transition output now returns:

- next engine state
- event list
- available actions
- turn completion flag

This structure is intentionally designed to make Phase 7 room integration easier because room handlers can translate engine events into synchronized state updates and UI-facing events without re-deriving what happened.

## Action Contracts Added

The first-wave engine actions align with the approved MVP command set:

- `roll_dice`
- `buy_property`
- `end_turn`

These are represented as pure engine actions rather than transport-layer socket messages.

## Event Contracts Added

The engine now has a baseline event model for:

- dice rolled
- player moved
- tile resolved
- payment applied
- property purchased
- jail state changed
- player eliminated
- turn advanced
- match ended

These are still pure TypeScript data events and do not imply network transport directly.

## Notes

- this step intentionally defines contracts before implementing rule logic
- the current contract set is designed for the simplified MVP rule set from Phase 1
- more advanced concepts such as card effects, auctions, and mortgage flows remain out of scope for this first engine contract wave

## Exit Criteria

Step 2 is complete when:

- the engine package has explicit state, action, and result contracts
- engine contracts remain transport-agnostic and persistence-agnostic
- randomness is injectable by contract
- the workspace remains typecheck- and build-clean after the new engine scaffolding is added