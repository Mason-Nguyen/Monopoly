# Phase 2 - Step 3: Command Contract Design

## Objective

Define the client-to-server command contracts for `LobbyRoom` and `MonopolyRoom`.

This step specifies which commands the client may send, what payload each command uses, when the command is valid, and what the server must validate before mutating room state.

## Design Principles

- Commands should be minimal and explicit
- The client never sends authoritative game outcomes
- Payloads should contain identifiers, not computed results
- Validation belongs entirely to the server
- Commands should be namespaced by room context

## Recommended Naming Convention

Use namespaced command identifiers:

- `lobby:setReady`
- `lobby:startMatch`
- `game:rollDice`
- `game:buyProperty`
- `game:endTurn`

Reason:

- easier room handler organization
- easier debugging and logging
- avoids collisions between lobby and gameplay actions

## Important Distinction

Not everything is a room command.

These actions are transport or session actions, not room commands:

- creating a room
- joining a room
- leaving a room
- reconnecting to a room

Those should be handled by Colyseus room join/leave/reconnect flow, not by regular message commands.

## 1. LobbyRoom Command Set

The lobby supports only the commands needed for ready flow and host-triggered start.

### Command: `lobby:setReady`

Purpose:

- allow a joined lobby player to change ready state

Suggested payload:

```ts
{
  isReady: boolean;
}
```

Allowed sender:

- any joined lobby player

Allowed room state:

- `waiting`

Server validation:

- sender belongs to the lobby
- lobby status is `waiting`
- sender is not blocked from participation
- payload contains a valid boolean

Success effect:

- update the player's `isReady` flag
- recalculate `canStartMatch`
- synchronize updated lobby state to all players

Reject if:

- sender is not in the lobby
- lobby status is not `waiting`
- payload is malformed

### Command: `lobby:startMatch`

Purpose:

- allow the host to request match start

Suggested payload:

```ts
{}
```

Allowed sender:

- host only

Allowed room state:

- `waiting`

Server validation:

- sender belongs to the lobby
- sender is the current host
- lobby status is `waiting`
- player count is between minimum and maximum allowed values
- all joined players are ready
- room is not already transitioning to start

Success effect:

- change lobby status to `starting`
- freeze ready changes and joins
- create or initialize the active `MonopolyRoom`
- begin room transfer flow

Reject if:

- sender is not host
- not all players are ready
- player count is below minimum
- lobby is already `starting` or `closed`

## LobbyRoom Actions Without Dedicated Commands

### Leave Lobby

- the client leaves the room using Colyseus leave or disconnect flow
- no custom `lobby:leave` command is required for MVP

### Join Lobby

- handled through room creation/join flow, not room messages

## Suggested Lobby Join Options

When joining a lobby room, the client should provide enough identity for room membership and UI display.

Suggested join options:

```ts
{
  playerId: string;
  displayName: string;
}
```

Optional later:

```ts
{
  avatarKey?: string;
}
```

## 2. MonopolyRoom Command Set

The gameplay room supports only the commands required by the MVP turn lifecycle.

### Command: `game:rollDice`

Purpose:

- request the start of movement for the active turn

Suggested payload:

```ts
{}
```

Allowed sender:

- active player only

Allowed room state:

- `playing`

Allowed turn phase:

- `await_roll`

Server validation:

- sender belongs to the match
- sender is the active player
- match status is `playing`
- turn phase is `await_roll`
- sender is not bankrupt
- sender is not abandoned
- sender is not blocked by unresolved jail logic

Success effect:

- server generates dice values
- server updates `TurnState`
- server resolves movement and tile flow according to rules

Reject if:

- sender is not active player
- turn is not waiting for roll
- match is finished
- sender is eliminated or invalid

Important:

- the client never sends dice values

### Command: `game:buyProperty`

Purpose:

- request purchase of the currently eligible property

Suggested payload:

```ts
{
  propertyId: string;
}
```

Allowed sender:

- active player only

Allowed room state:

- `playing`

Allowed turn phase:

- `await_optional_action`

Server validation:

- sender belongs to the match
- sender is the active player
- match status is `playing`
- turn phase is `await_optional_action`
- `canBuyCurrentProperty` is true
- payload `propertyId` matches the property being resolved
- property is unowned
- player has enough balance

Success effect:

- deduct purchase price from player balance
- assign property ownership
- update board/property state
- move turn toward `await_end_turn`

Reject if:

- wrong phase
- property is not buyable
- property is already owned
- player lacks funds
- payload does not match current resolvable property

### Command: `game:endTurn`

Purpose:

- request the end of the player's turn

Suggested payload:

```ts
{}
```

Allowed sender:

- active player only

Allowed room state:

- `playing`

Allowed turn phases:

- `await_optional_action`
- `await_end_turn`

Reason:

- in MVP, the player may skip optional purchase and end turn
- once all mandatory resolution is complete, the player may explicitly finish the turn

Server validation:

- sender belongs to the match
- sender is the active player
- match status is `playing`
- turn phase allows end-turn behavior
- all mandatory payments and tile effects are already resolved

Success effect:

- if in `await_optional_action`, skip purchase and continue
- mark turn complete
- advance to next eligible player
- initialize next turn state

Reject if:

- sender is not active player
- turn phase is invalid
- unresolved mandatory state still exists
- match is not in `playing`

## MonopolyRoom Actions Without Dedicated Commands

### Leave Match

- leaving is handled by disconnect or room leave behavior
- Step 5 rules define how disconnect and abandonment are resolved
- no explicit `game:leave` command is needed for MVP

### Reconnect to Match

- reconnect is handled by Colyseus reconnect flow
- no explicit `game:reconnect` command is needed for MVP

## Suggested Match Join or Reconnect Options

The active match room should receive enough join context to bind the client to the correct reserved player slot.

Suggested join or reconnect options:

```ts
{
  playerId: string;
  matchId: string;
}
```

Optional later if needed:

```ts
{
  reconnectToken?: string;
}
```

## Common Validation Rules Across All Commands

Every command handler should validate at least:

- sender identity is known
- sender belongs to the current room
- room state allows the command
- match or lobby status allows the command
- payload shape is valid

Gameplay commands should additionally validate:

- sender is active player when required
- turn phase allows the command
- sender is not bankrupt
- sender is not abandoned

## Payload Design Guidance

Payloads should follow these rules:

- keep them as small as possible
- send identifiers instead of derived values
- never trust client-sent calculations
- allow server to cross-check payload against current room state

Examples:

- good: `propertyId`
- bad: `purchasePrice`, `diceTotal`, `newBalance`

## Command Rejection Behavior

If a command fails validation:

- the room state must not change
- the rejection should be logged server-side
- the server may later send an explicit error event or rely on unchanged state, depending on Step 4 event design

## Recommended Logging Fields for Commands

When logging commands later, capture at least:

- command name
- room ID
- player ID
- current room status
- current turn phase if applicable
- validation outcome

## Suggested Shared Types to Create Later

Phase 2 should later create shared payload types for:

- `LobbySetReadyCommand`
- `LobbyStartMatchCommand`
- `GameRollDiceCommand`
- `GameBuyPropertyCommand`
- `GameEndTurnCommand`

## Step 3 Deliverables

This step should produce:

- room-specific command list
- payload shape for each command
- sender rules for each command
- state and phase validation rules for each command
- guidance for join/reconnect options outside normal commands

## Exit Criteria

Step 3 is complete when:

- every MVP client action maps to a clear command contract
- command payloads are minimal and explicit
- validation expectations are defined
- Phase 2 Step 4 can build event and payload design on top of these contracts
