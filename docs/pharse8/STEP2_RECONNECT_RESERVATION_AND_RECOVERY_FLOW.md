# Phase 8 - Step 2: Reconnect Reservation and Recovery Flow

## Objective

Define the reconnect reservation flow for live `MonopolyRoom` sessions so a temporarily disconnected player can safely recover the same seat, while invalid or expired reclaim attempts are rejected predictably.

This step is still design-first. It specifies the recovery flow that later implementation steps will enforce.

## Why This Step Exists

Phase 7 left the room with a workable baseline:

- `onDrop()` reserves a player slot for `90s`
- `onReconnect()` restores connection flags
- `MatchJoinOptions` already carries `playerId`, `matchId`, and optional `reconnectToken`

What is not yet fully locked is:

- what exactly owns a reserved seat
- when a new socket may reclaim an existing seat
- what happens if a player reconnects after expiry
- how duplicate or invalid reclaim attempts should be treated
- how much trust MVP places on `playerId` versus `reconnectToken`

## Scope of This Step

Primary target:

- `MonopolyRoom`

Secondary note:

- `LobbyRoom` can continue using simpler leave/rejoin semantics before match start

## Core Reconnect Model

### Seat Ownership Principle

During an active match, every seat belongs to a specific gameplay identity:

- `playerId`
- turn order
- owned properties
- balance
- jail state
- connection state

A reconnect does not create a new player.

It must reclaim the existing seat for the same gameplay identity.

### Reserved Slot Principle

When a player disconnects temporarily, the room reserves:

- the seat itself
- the current gameplay identity
- the reconnect window deadline

The room does not reserve a generic empty slot.

It reserves the exact seat belonging to that disconnected player.

## Reservation State Model

A player seat in `MonopolyRoom` should be interpreted using these states:

### `connected`

- the seat is actively controlled by a current socket
- gameplay commands from that player may be accepted if other rules allow them

### `disconnected_reserved`

- the player lost the socket
- the seat is still owned by that player
- the seat may be reclaimed only within the reconnect window
- no other player may take over the seat

### `reconnected`

- the player has successfully reclaimed the seat during the valid reconnect window
- this state is mainly a UX signal and may later normalize back to `connected`

### `abandoned`

- the reservation is over
- the player no longer has reclaim rights for the current match
- any later reconnect attempt must be rejected

## Reservation Identity Rules for MVP

### Primary Identity Key

For MVP, the reserved seat is keyed by `playerId`.

That means:

- reconnect attempts must present the same `playerId`
- room lookup for reclaim is based on the existing player entry in `state.players`

### `reconnectToken` in MVP

`reconnectToken` remains part of `MatchJoinOptions`, but for the current MVP phase it should be treated as:

- optional support metadata
- useful for future hardening
- not the sole authority for reclaim in the current implementation wave

Reason:

- the project already models players primarily by `playerId`
- Step 2 should not introduce a heavier auth model than the current system supports
- future phases can harden reconnect ownership without changing the room lifecycle shape

## Approved Reconnect Flow

### Case 1 - Temporary Disconnect During Active Match

When a player drops connection:

1. keep the existing player entry in `state.players`
2. set `connection.status = disconnected_reserved`
3. set `reconnectDeadlineAt = now + 90s`
4. keep gameplay identity intact
5. emit `game:playerConnectionChanged`

Result:

- the seat is now reserved for the same player only
- the match continues or pauses according to the active-player rules from Step 1

### Case 2 - Successful Reclaim Before Deadline

When a client rejoins the same match before the reconnect deadline:

1. send `MatchJoinOptions` with the same `playerId` and `matchId`
2. find the existing player entry in room state
3. confirm the seat is currently `disconnected_reserved`
4. confirm the reconnect deadline has not expired
5. rebind the new socket to that player identity
6. clear `reconnectDeadlineAt`
7. set connection state to `reconnected`
8. emit `game:playerConnectionChanged`
9. rely on synchronized room state to restore full match UI

Result:

- the player regains exactly the same seat
- no gameplay identity is recreated
- no gameplay elimination occurs

### Case 3 - Join While Already Connected

If a second socket tries to join using a `playerId` that is already `connected`:

MVP rule:

- reject the duplicate control attempt
- do not silently replace the active socket

Reason:

- silent replacement is risky without stronger auth/session guarantees
- explicit takeover support can be added later if needed

### Case 4 - Reconnect After Deadline Expired

If a client tries to reclaim after the seat has already become `abandoned`:

- reject the reconnect attempt
- do not recreate control of the seat
- do not revive the player into active competition

Reason:

- abandonment is a finalized gameplay-affecting lifecycle outcome
- the client may later be allowed to view results in a separate UX flow, but not reclaim match control

### Case 5 - Unknown Player Reconnect Attempt

If a reconnect attempt provides a `playerId` not present in room state:

- reject the attempt for an active match
- do not create a new match player dynamically

Reason:

- live matches should not accept new players after authoritative initialization
- seat reclaim is only for known pre-existing participants

## Join and Reclaim Rules by Match State

### Match Status: `playing`

Allowed:

- reclaim an existing reserved seat for the same player identity

Rejected:

- joining as a brand-new player
- reclaiming a seat that belongs to someone else
- reclaiming after abandonment
- duplicate active control for a connected seat

### Match Status: `finished`

MVP direction:

- gameplay re-entry is not required
- result-view re-entry can be considered later, but is not part of current reconnect control logic

## Recovery Expectations for the Client

When reconnect succeeds, the client should:

- rely on the latest synchronized Colyseus state
- rebuild turn UI, balances, ownership, and result state from room state
- treat explicit events only as transient UX helpers

The client should not attempt local rollback or replay of missed gameplay events.

## Interaction with Active-Turn Disconnects

If the disconnected player was the active player:

- reclaim should restore them to the exact current room state
- the room should not fabricate new gameplay progress during the reserved window
- when they reconnect, the turn should still reflect the same authoritative phase unless expiry resolution has already occurred

This preserves the Phase 1 MVP rule that active-turn disconnects temporarily pause player input rather than immediately forcing a forfeit.

## Interaction with Non-Active Disconnects

If the disconnected player was not the active player:

- reclaim should restore their future participation rights
- no special turn restoration logic is needed beyond restoring connection ownership
- all gameplay truth comes from current synchronized room state

## Rejection Cases That Must Be Explicit

The room should explicitly reject:

- missing `playerId`
- mismatched `matchId`
- reclaim attempt for a player not in `state.players`
- reclaim attempt when the seat is already `abandoned`
- reclaim attempt after the reconnect deadline passed
- duplicate control attempt while the seat is already `connected`
- attempt to create a brand-new player in a match already in progress

## Implementation Implications for Step 3 and Step 4

This step implies the next implementation steps should:

- stop allowing ad-hoc creation of new match players during `playing`
- centralize seat reclaim validation inside `MonopolyRoom`
- split successful reconnect from invalid join attempts clearly
- prepare a single authoritative path that converts reconnect expiry or consented leave into abandonment handling

## Exit Criteria

Step 2 is complete when:

- reserved seat ownership is clearly defined
- reclaim behavior before deadline is explicit
- reclaim failure cases are explicit
- the project has a stable reconnect/recovery model for later implementation
