# Phase 2 - Step 4: Event and Payload Design

## Objective

Define the server-to-client event model for `LobbyRoom` and `MonopolyRoom`, including when synchronized room state is enough and when explicit events should be sent for UX, animation, and feedback.

This step complements Step 2 state design and Step 3 command design.

## Core Principle

The synchronized Colyseus room state is the source of truth.

Explicit events exist only to improve UX for:

- transient notifications
- animation triggers
- command errors
- room transfer and flow cues
- action summaries that should not require the client to diff state manually

## Event Strategy

Use two layers together:

### Layer 1 - State Sync

Use Colyseus synchronized state for:

- current lobby composition
- ready flags
- host identity
- whether match can start
- match status
- turn owner and turn phase
- player positions and balances
- property ownership
- jail state
- connection state
- final match result

### Layer 2 - Explicit Events

Use room messages for:

- command rejection or validation errors
- dice roll reveal cues
- movement summary cues
- tile resolution summary
- property purchase confirmation
- payment notification
- bankruptcy or abandonment announcement
- room transition instructions
- reconnect or timeout announcements when useful to UX

## Important Rule

A client must be able to recover correct game UI from room state alone after reconnect.

That means:

- explicit events are helpful, but not authoritative
- if an event is missed, the synchronized room state must still be enough to continue correctly

## Recommended Event Naming Convention

Use namespaced server events:

- `lobby:error`
- `lobby:matchStarting`
- `lobby:matchStartFailed`
- `game:error`
- `game:diceRolled`
- `game:playerMoved`
- `game:tileResolved`
- `game:paymentApplied`
- `game:propertyPurchased`
- `game:playerEliminated`
- `game:playerConnectionChanged`
- `game:resultReady`

Reason:

- easy to inspect in logs
- easy to route in frontend state listeners
- avoids ambiguous generic event names

## 1. LobbyRoom Event Design

### Event: `lobby:error`

Purpose:

- provide explicit feedback when a lobby command is rejected

When sent:

- invalid `lobby:setReady`
- invalid `lobby:startMatch`
- host-only restriction fails
- room state no longer allows requested action

Suggested payload:

```ts
{
  code: string;
  message: string;
}
```

Suggested example codes:

- `NOT_HOST`
- `ROOM_NOT_WAITING`
- `NOT_ENOUGH_PLAYERS`
- `PLAYERS_NOT_READY`
- `INVALID_PAYLOAD`

### Event: `lobby:matchStarting`

Purpose:

- notify clients that start validation succeeded and room transfer is beginning

When sent:

- immediately after lobby status becomes `starting`

Suggested payload:

```ts
{
  lobbyId: string;
  matchId: string;
  transferDeadlineAt?: number;
}
```

Notes:

- useful for showing loading UI and disabling lobby interactions
- room state still remains the source of truth for lobby status

### Event: `lobby:matchStartFailed`

Purpose:

- notify players that start flow failed and the room returned to `waiting`

When sent:

- active match room creation or transfer failed

Suggested payload:

```ts
{
  code: string;
  message: string;
}
```

Suggested example codes:

- `TRANSFER_TIMEOUT`
- `MATCH_ROOM_CREATION_FAILED`
- `START_CANCELLED`

## 2. MonopolyRoom Event Design

### Event: `game:error`

Purpose:

- provide explicit feedback when a gameplay command is rejected

When sent:

- invalid `game:rollDice`
- invalid `game:buyProperty`
- invalid `game:endTurn`

Suggested payload:

```ts
{
  code: string;
  message: string;
}
```

Suggested example codes:

- `NOT_ACTIVE_PLAYER`
- `INVALID_TURN_PHASE`
- `PROPERTY_NOT_BUYABLE`
- `INSUFFICIENT_FUNDS`
- `MATCH_NOT_PLAYING`
- `PLAYER_ELIMINATED`
- `INVALID_PAYLOAD`

### Event: `game:diceRolled`

Purpose:

- provide a direct cue for dice animation and roll reveal

When sent:

- after the server accepts `game:rollDice` and generates dice values

Suggested payload:

```ts
{
  playerId: string;
  diceValueA: number;
  diceValueB: number;
  diceTotal: number;
}
```

Note:

- dice values also exist in synchronized `TurnState`
- event is primarily for animation timing and UX

### Event: `game:playerMoved`

Purpose:

- provide movement summary for animation and feed UI

When sent:

- after the server resolves movement

Suggested payload:

```ts
{
  playerId: string;
  fromTileIndex: number;
  toTileIndex: number;
  passedStart: boolean;
}
```

Note:

- final position is still authoritative in synchronized player state
- this event helps animate motion without expensive state diff logic

### Event: `game:tileResolved`

Purpose:

- explain the tile outcome that was just resolved

When sent:

- after tile resolution completes

Suggested payload:

```ts
{
  playerId: string;
  tileIndex: number;
  tileType: string;
  summaryCode: string;
  message: string;
}
```

Suggested `summaryCode` examples:

- `LANDED_ON_START`
- `PROPERTY_AVAILABLE`
- `PAID_RENT`
- `PAID_TAX`
- `WENT_TO_JAIL`
- `NO_EFFECT`

### Event: `game:paymentApplied`

Purpose:

- provide clear payment feedback for HUD, transaction feed, and animation

When sent:

- after any mandatory or explicit money transfer is applied

Suggested payload:

```ts
{
  fromPlayerId: string;
  toPlayerId?: string;
  amount: number;
  reason: string;
}
```

Suggested `reason` examples:

- `property_purchase`
- `rent`
- `tax`
- `start_salary`

Note:

- balances in player state remain authoritative
- this event is for user-facing explanation and feed items

### Event: `game:propertyPurchased`

Purpose:

- explicitly announce ownership change for UI feedback

When sent:

- after a property purchase succeeds

Suggested payload:

```ts
{
  playerId: string;
  propertyId: string;
  tileIndex: number;
  purchasePrice: number;
}
```

Note:

- property ownership is still authoritative in synchronized board/property state

### Event: `game:playerEliminated`

Purpose:

- notify clients that a player has left active play

When sent:

- after bankruptcy
- after abandonment timeout

Suggested payload:

```ts
{
  playerId: string;
  reason: string;
}
```

Suggested `reason` examples:

- `bankrupt`
- `abandoned`

### Event: `game:playerConnectionChanged`

Purpose:

- provide explicit UX feedback when a player disconnects, reconnects, or times out

When sent:

- connection state changes during live match

Suggested payload:

```ts
{
  playerId: string;
  status: string;
  reconnectDeadlineAt?: number;
}
```

Suggested status values:

- `connected`
- `disconnected_reserved`
- `reconnected`
- `abandoned`

Note:

- connection status also exists in synchronized player state
- event is useful for toasts, pause banners, and urgency UI

### Event: `game:resultReady`

Purpose:

- notify clients that the match is finished and result UI should open

When sent:

- after match result is finalized

Suggested payload:

```ts
{
  winnerPlayerId: string;
  endReason: string;
  finishedAt: number;
}
```

Note:

- the same truth is also stored in synchronized `result`

## 3. Which Cases Need Only State Sync

These behaviors can be driven entirely from synchronized state without explicit events if desired:

- player ready list updates
- host reassignment
- start button enabled or disabled state
- turn owner indicator
- current balances
- current positions
- current property owners
- jail indicator
- finished match screen content

## 4. Which Cases Benefit Strongly from Explicit Events

These are worth explicit events even though state also changes:

- dice reveal
- movement animation
- command rejection messages
- payment feed entries
- property purchase toast or animation
- bankruptcy announcement
- disconnect and reconnect notice
- match-start loading flow

## Event Payload Design Guidance

Event payloads should:

- be concise and human-usable for UI
- contain IDs and factual summary data
- avoid duplicating entire room state
- avoid embedding server-only internals

Good pattern:

- event carries a small summary
- room state carries the complete authoritative state

## Error Event Strategy

Use explicit error events instead of relying only on unchanged state.

Reason:

- improves usability
- helps the frontend explain why a click did nothing
- reduces guesswork after rejected commands

Recommended shape for all error events:

```ts
{
  code: string;
  message: string;
}
```

## Event Delivery Expectations

Clients should treat explicit events as ephemeral helpers.

Recommended client behavior:

- update core UI from synchronized state
- use events for animations, feed items, toasts, and banners
- on reconnect, rebuild full UI from state, not from past events

## Suggested Shared Event Types to Create Later

Phase 2 should later create shared event types for:

- `LobbyErrorEvent`
- `LobbyMatchStartingEvent`
- `LobbyMatchStartFailedEvent`
- `GameErrorEvent`
- `GameDiceRolledEvent`
- `GamePlayerMovedEvent`
- `GameTileResolvedEvent`
- `GamePaymentAppliedEvent`
- `GamePropertyPurchasedEvent`
- `GamePlayerEliminatedEvent`
- `GamePlayerConnectionChangedEvent`
- `GameResultReadyEvent`

## Step 4 Deliverables

This step should produce:

- a rule for when state sync is enough
- a rule for when explicit events are appropriate
- a named event list for lobby and gameplay rooms
- payload shape guidance for each event
- a standard error event strategy

## Exit Criteria

Step 4 is complete when:

- clients can be designed around state plus explicit events without ambiguity
- transient UX cases are covered cleanly
- command rejection handling is defined
- Phase 2 Step 5 can build the board config model without affecting the event model
