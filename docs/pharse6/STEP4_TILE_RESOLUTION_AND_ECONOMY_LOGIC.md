# Phase 6 - Step 4: Tile Resolution and Economy Logic

## Objective

Extend the pure game engine so a dice roll resolves the landed tile into real MVP gameplay outcomes instead of stopping at movement only.

This step turns the engine into a more useful rule authority for:

- property eligibility
- property purchase
- rent application
- tax application
- free parking and neutral tile resolution
- jail entry through `go_to_jail`

## Implemented Scope

The Step 4 implementation includes:

- tile lookup helpers for board-driven rule resolution
- tile resolution for `start`, `property`, `tax`, `jail`, `go_to_jail`, `free_parking`, and `neutral`
- optional property purchase eligibility after landing on an unowned property
- `buy_property` command execution
- mandatory tax and rent payment handling for solvent paths
- forced movement into jail when landing on `go_to_jail`
- turn-phase transitions from tile resolution into either `await_optional_action` or `await_end_turn`

## Files Added or Updated

### `packages/game-engine`

- `src/reducers/turn.ts`
- `src/resolvers/board.ts`
- `src/resolvers/economy.ts`
- `src/resolvers/tile.ts`
- `src/resolvers/index.ts`
- `src/rules/transition.ts`

### `packages/shared-config`

- `src/constants/game.ts`

### `docs/pharse6`

- `STEP4_TILE_RESOLUTION_AND_ECONOMY_LOGIC.md`

## Rule Behavior Added

### Property Tiles

When the active player lands on a property tile:

- if the property is unowned and the player can afford it, the engine moves to `await_optional_action`
- if the property is unowned but the player cannot afford it, the engine moves to `await_end_turn`
- if the property is owned by the active player, the engine resolves the tile and waits for `end_turn`
- if the property is owned by another player, the engine applies rent automatically and waits for `end_turn`

### Property Purchase

The engine now executes `buy_property` when:

- the current turn phase is `await_optional_action`
- the current tile is the same unowned property referenced by the action
- the active player has enough balance to pay the purchase price

A successful purchase now:

- reduces player balance
- assigns property ownership
- appends the property ID to the player-owned property list
- emits `payment_applied` and `property_purchased`
- moves the turn to `await_end_turn`

### Tax Tiles

When the active player lands on a tax tile:

- the engine emits `tile_resolved`
- the engine subtracts the tax amount immediately
- the engine emits `payment_applied` with reason `tax`
- the turn moves to `await_end_turn`

### Go To Jail

When the active player lands on `go_to_jail`:

- the engine emits `tile_resolved`
- the player is forced to the configured jail tile
- the engine emits a second `player_moved` event for the forced transfer
- the player's jail state becomes `isInJail = true` and `turnsRemaining = 1`
- the engine emits `jail_state_changed`
- the turn moves to `await_end_turn`

### Neutral, Jail, Free Parking, and Start

Landing on the following tiles now resolves cleanly and ends with `await_end_turn`:

- `start`
- `neutral`
- `jail`
- `free_parking`

No extra reward beyond previously handled start salary is applied in this step.

## Important Current Limitation

Step 4 handles only the solvent economy path.

That means:

- mandatory `rent` or `tax` payments that would require bankruptcy resolution still throw a rule error for now
- bankruptcy and player elimination are deferred to Step 5
- jail release and skipped-turn behavior are deferred to Step 5

## Verification

Step 4 should be considered complete when the following checks pass:

- `npm run typecheck --workspace @monopoly/game-engine`
- `npm run build --workspace @monopoly/game-engine`
- `npm run typecheck`
- `npm run build`
- smoke flows for `buy_property`, `rent`, `tax`, and `go_to_jail`

## Notes

- tile resolution is now data-driven from `BoardConfig`
- `roll_dice` now resolves movement and tile outcome in one deterministic engine transition
- the engine stays pure and does not depend on Colyseus or database models
