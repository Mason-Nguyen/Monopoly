# Phase 6 - Step 5: Jail and Bankruptcy Logic

## Objective

Complete the MVP failure-path gameplay rules inside the pure engine so jail and bankruptcy no longer depend on room-layer patches or temporary rule errors.

This step finalizes:

- simplified jail skip and release behavior
- bankruptcy elimination behavior
- property reset on elimination
- winner detection after elimination
- automatic turn advancement around jailed players

## Implemented Scope

The Step 5 implementation includes:

- bankruptcy resolution instead of throwing when a mandatory payment cannot be made
- property release back to the bank when a player is eliminated
- immediate match-end detection when only one active player remains
- automatic jail skip during turn advancement
- automatic jail release after the skipped turn
- `availableActions` returning an empty list for finished matches

## Files Added or Updated

### `packages/game-engine`

- `src/resolvers/elimination.ts`
- `src/resolvers/turn-advancement.ts`
- `src/resolvers/economy.ts`
- `src/resolvers/tile.ts`
- `src/resolvers/index.ts`
- `src/rules/available-actions.ts`
- `src/rules/transition.ts`

### `docs/pharse6`

- `STEP5_JAIL_AND_BANKRUPTCY_LOGIC.md`

## Rule Behavior Added

### Bankruptcy

When a player cannot pay a mandatory amount such as `rent` or `tax`:

- the player is eliminated immediately with reason `bankrupt`
- the player balance becomes `0`
- all owned properties become unowned again
- the player is removed from future active-turn rotation through the existing active-player filter
- the engine emits `player_eliminated`

The MVP engine still does not support partial payment or creditor asset transfer.

### Match End After Elimination

After a bankruptcy, the engine now checks how many active players remain.

If only one active player remains:

- the match status becomes `finished`
- `result` is populated
- the engine emits `match_ended`
- `availableActions` becomes empty

### Jail Skip and Release

When turn advancement reaches a player who is in jail with `turnsRemaining > 0`:

- the engine advances into that player's skipped turn
- the jail counter is reduced
- the player is automatically released when the counter reaches `0`
- the engine emits `jail_state_changed`
- the turn advances again to the next eligible player

For the current MVP value of `turnsRemaining = 1`, this means:

- the jailed player skips exactly one full turn
- the player is released immediately after that skipped turn
- on the following cycle, the player can act normally again

## Important Remaining Limitation

Step 5 completes the approved MVP jail and bankruptcy baseline, but still does not add:

- chance or community chest card effects
- abandonment transitions from room networking events
- advanced surrender flows
- creditor asset transfer

Those behaviors remain outside the pure engine or belong to later phases.

## Verification

Step 5 should be considered complete when the following checks pass:

- `npm run typecheck --workspace @monopoly/game-engine`
- `npm run build --workspace @monopoly/game-engine`
- `npm run typecheck`
- `npm run build`
- smoke flows for bankruptcy-by-tax, bankruptcy-by-rent, winner detection, and jail skip/release

## Notes

- bankruptcy is now a real deterministic state transition instead of an engine error
- turn advancement is now responsible for skipping jailed players automatically
- the engine remains pure and room-agnostic
