# Step 3 - Turn Lifecycle Definition

## Objective

Define the exact turn flow for the MVP so later phases can model commands, validations, and synchronized state clearly.

This step focuses on turn order, action order, and server-authoritative action handling.

## Turn Lifecycle Summary

In the MVP, each turn follows a strict sequence:

1. The server identifies the active player.
2. The active player rolls dice.
3. The server resolves movement.
4. The server resolves the landed tile.
5. If the tile is an unowned purchasable property, the player may buy it.
6. If the tile requires payment, the server applies the payment.
7. The active player ends the turn.
8. The server advances to the next eligible player.

## Design Principle

The turn system must be phase-based and server-authoritative.

That means:

- the client only sends allowed commands
- the server decides whether the command is valid in the current turn phase
- the server applies all game state changes
- the client only reacts to synchronized room state updates

## Turn Participants

### Active Player

The active player is the only player allowed to perform turn actions.

The active player may:

- roll dice when the turn begins
- buy property if the current tile allows it
- end the turn when all required resolution is complete

### Non-Active Players

Non-active players may:

- receive state updates
- view the board and turn progress

Non-active players may not:

- roll dice
- buy property for the active player
- end the current turn
- trigger gameplay state changes directly

## Recommended Turn Phases

For MVP, each turn should move through the following internal phases:

- `await_roll`
- `resolving_movement`
- `resolving_tile`
- `await_optional_action`
- `await_end_turn`
- `turn_complete`

Reason:

- This keeps action validation simple
- It maps well to Colyseus room state
- It prevents invalid or duplicated commands from being accepted

## Turn Phase Details

### Phase 1 - `await_roll`

Meaning:

- The turn has started and the active player must roll dice.

Allowed command:

- `rollDice`

Blocked commands:

- `buyProperty`
- `endTurn`

Server behavior:

- verify the sender is the active player
- verify the turn phase is `await_roll`
- generate the dice result server-side
- move the turn into movement resolution

### Phase 2 - `resolving_movement`

Meaning:

- The server is applying movement from the dice result.

Allowed player command:

- none

Blocked commands:

- all gameplay commands

Server behavior:

- calculate new position
- detect whether the player passed start if that rule is enabled
- update player board position
- continue into tile resolution

### Phase 3 - `resolving_tile`

Meaning:

- The server is resolving the effect of the tile where the player landed.

Allowed player command:

- none

Blocked commands:

- all gameplay commands until tile resolution completes

Server behavior:

- identify tile type
- apply mandatory effects automatically
- determine whether the player has an optional follow-up action
- if the tile is an unowned property, advance to `await_optional_action`
- otherwise advance to `await_end_turn`

### Phase 4 - `await_optional_action`

Meaning:

- The player may perform an optional follow-up action.

Allowed command:

- `buyProperty`
- `endTurn`

Blocked commands:

- `rollDice`

Server behavior:

- verify the sender is the active player
- verify the property is buyable
- if the player buys the property, update balance and ownership
- once optional action is resolved, move to `await_end_turn`

### Phase 5 - `await_end_turn`

Meaning:

- All required turn resolution is complete and the active player can finish the turn.

Allowed command:

- `endTurn`

Blocked commands:

- `rollDice`
- `buyProperty` unless the property decision is still intentionally open in the current state

Server behavior:

- verify the sender is the active player
- verify all mandatory turn resolution is complete
- mark the turn as complete
- advance to the next eligible player

### Phase 6 - `turn_complete`

Meaning:

- The current turn is done and the server is preparing the next turn.

Allowed player command:

- none

Server behavior:

- select next non-bankrupt player
- increment turn counter if needed
- initialize next turn state as `await_roll`

## Mandatory Commands for MVP

The MVP needs the following gameplay commands:

- `rollDice`
- `buyProperty`
- `endTurn`

These are enough for the first playable loop.

## Optional Commands Deferred to Later Phases

The following commands are intentionally excluded from MVP for now:

- `trade`
- `mortgage`
- `buildHouse`
- `sellHouse`
- `useCard`
- `payToLeaveJail`
- `useJailCard`

## Turn Order Rules

### Match Start

- Turn order is randomized once when the match starts.
- The randomized order remains stable for the match.

### Turn Advancement

- After a turn is completed, the server selects the next non-bankrupt player in order.
- Bankrupt players are skipped.
- Eliminated players never re-enter turn order.

## Validation Rules for Commands

For every gameplay command, the server must validate:

- the sender belongs to the room
- the sender is the active player if the action is turn-specific
- the current turn phase allows the command
- the match is still in `playing` state
- the player is not bankrupt or eliminated

If validation fails:

- the command is rejected
- the server state does not change
- the client may receive an error or ignore response depending on implementation choice later

## Dice Rules for MVP

- Dice results are generated only by the server
- Movement is based on the server dice result
- The client never submits its own dice value
- Double-roll rules are deferred unless explicitly added later

Reason:

- This keeps the MVP fair and simplifies turn flow

## Property Purchase Rules for MVP

A player may buy property only if all of the following are true:

- the player is the active player
- the current turn phase allows optional action
- the tile is purchasable
- the tile is currently unowned
- the player has enough money

If the purchase succeeds:

- player balance is reduced
- property ownership is assigned
- the turn moves to `await_end_turn`

If the player does not buy:

- the player may end the turn
- auction flow is deferred to later phases

## Rent Rules in Turn Flow

When a player lands on a property owned by another player:

- rent resolution is automatic on the server
- the player does not choose whether to pay
- balances are updated immediately
- if payment cannot be made, bankruptcy rules apply
- after mandatory resolution finishes, the turn proceeds toward `await_end_turn`

## Jail Handling in Turn Flow

For MVP, jail is simplified.

Baseline behavior:

- if a player is in jail, the server checks jail state at the beginning of the player's turn
- the player may have restricted or skipped movement depending on the simplified jail rule finalized in Step 4
- jail should not allow custom branching actions in MVP beyond the simplified rule set

## Turn End Conditions

A turn may end only when:

- movement has been resolved
- tile effects have been resolved
- mandatory payments have been applied
- optional property purchase has been resolved or skipped
- the active player is still eligible to end the turn

## Turn Failure and Invalid Action Examples

Examples of invalid actions:

- a non-active player sends `rollDice`
- the active player sends `endTurn` before movement is resolved
- the active player sends `buyProperty` on a non-purchasable tile
- a bankrupt player sends any turn command
- a player sends `rollDice` twice in one turn

Expected server response behavior:

- reject the action
- do not mutate game state
- preserve the current turn phase

## Turn State Data Needed Later

Phase 2 should model the following turn-related state:

- current turn number
- active player ID
- turn phase
- latest dice result
- current tile being resolved
- whether optional purchase is available
- whether the turn is waiting for explicit player input

## Step 3 Deliverables

This step should produce:

- a strict turn sequence
- a list of MVP gameplay commands
- turn phase definitions
- command validation rules
- turn end rules

## Exit Criteria

Step 3 is complete when:

- the valid actions in a turn are explicit
- turn phase transitions are explicit
- server authority over turn flow is explicit
- Phase 2 can model turn state without ambiguity

## Notes for Later Steps

- Step 4 will finalize the exact rules for starting money, rent details, and jail behavior
- Step 5 will define disconnect behavior during an active turn
