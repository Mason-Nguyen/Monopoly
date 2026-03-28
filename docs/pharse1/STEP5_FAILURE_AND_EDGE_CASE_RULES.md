# Step 5 - Failure and Edge-Case Rules

## Objective

Define the MVP behavior for disconnects, reconnects, idle players, room transfer failures, and other non-happy-path situations.

This step ensures the game remains predictable when real players leave, lose connection, or stop responding.

## Design Direction

The MVP should handle common multiplayer failures with clear and simple outcomes.

Priorities:

- keep the match authoritative on the server
- allow short-term recovery through reconnect
- avoid complex restoration logic
- prevent a single absent player from blocking the whole game forever

## Connection States for MVP

A player may be in one of these connection-related states:

- `connected`
- `disconnected_reserved`
- `reconnected`
- `abandoned`

Meaning:

- `connected`: player is currently active in the room
- `disconnected_reserved`: player has temporarily disconnected but still owns a reserved slot
- `reconnected`: player returned during the reconnect window
- `abandoned`: reconnect window expired or the player was removed from active participation

## Core Timeout Values for MVP

### Reconnect Window During Active Match

Decision:

- a disconnected player has `90 seconds` to reconnect during an active match

Reason:

- long enough for a quick network issue or page reload
- short enough to avoid blocking the room too long

### Room Transfer Grace Period During Match Start

Decision:

- when moving from lobby flow into the active Monopoly room, each player has `30 seconds` to complete the transfer

Reason:

- room handoff is a brief technical step, not a gameplay pause
- players should not hold the full room startup indefinitely

### Turn Idle Timeout

Decision:

- an active connected player has `60 seconds` to act when the turn is waiting for player input

Applies during:

- `await_roll`
- `await_optional_action`
- `await_end_turn`

Reason:

- prevents connected-but-idle players from blocking the match
- keeps MVP matches moving without adding moderator tools first

## Lobby Failure Rules

### Disconnect or Leave Before Match Start

If a player disconnects or leaves while the lobby is in `waiting`:

- remove the player from the lobby
- clear the player's ready state
- if the owner leaves, assign ownership to another remaining player
- if the room becomes empty, close the lobby
- if player count falls below the minimum start requirement, match start is blocked until enough players join again

### Disconnect During Lobby Ready Flow

If a player disconnects after readying up but before the match starts:

- the player is removed from the lobby for MVP simplicity
- the ready state is recalculated for remaining players
- all-ready start conditions must be satisfied again before the game can start

Reason:

- this is easier than reserving lobby seats before the match begins

## Match Start Failure Rules

### Failure During Lobby-to-Match Transfer

If the room is in `starting` and one or more players fail to join the active Monopoly room within `30 seconds`:

- cancel the current start attempt
- return the lobby back to `waiting`
- clear all ready flags
- keep connected players in the lobby if the lobby still exists
- close the lobby only if no players remain

Reason:

- this avoids creating a partially started match
- players can retry without rebuilding the room manually

## Active Match Disconnect Rules

### Non-Active Player Disconnects During Match

If a non-active player disconnects while the match is in `playing`:

- mark the player as `disconnected_reserved`
- reserve the player's slot for `90 seconds`
- keep the match running normally
- allow the player to reconnect and resume spectator or future-turn participation

If the player reconnects in time:

- restore the player to active participation
- resume normal play with no penalty

If the reconnect window expires:

- mark the player as `abandoned`
- remove the player from future turn order
- set owned properties back to unowned bank state
- check whether the match now has only one active player remaining

### Active Player Disconnects During Match

If the active player disconnects during their turn:

- mark the player as `disconnected_reserved`
- pause turn progression
- start the `90 second` reconnect timer
- keep the turn state unchanged while waiting for reconnect

If the player reconnects in time:

- restore the player to the same turn phase
- resume the turn from the exact server state

If the reconnect window expires:

- mark the player as `abandoned`
- remove the player from active play
- set owned properties back to unowned bank state
- end the interrupted turn
- advance to the next eligible player
- evaluate end-game conditions immediately after removal

## Connected-but-Idle Rules

A connected player may still block the match by not acting.

For MVP, use a simple turn timeout.

### Idle Timeout Behavior

If the active player is connected but does not act within `60 seconds` during an input phase:

- the server automatically resolves the waiting action using the safest default

### Auto-Resolution Rules by Turn Phase

If timeout happens in `await_roll`:

- the server auto-rolls dice for the player

If timeout happens in `await_optional_action`:

- the server treats the property purchase as declined
- the turn moves to `await_end_turn`

If timeout happens in `await_end_turn`:

- the server auto-ends the turn

Reason:

- this preserves forward progress
- it avoids needing moderator controls in the MVP

## Reconnect Rules

When a disconnected player reconnects within the allowed window:

- re-associate the connection with the reserved player slot
- send the latest synchronized match state from the server
- restore the player's participation rights based on current match state
- if the player reconnects during their own paused turn, resume the turn

The client should not try to restore state locally.

The server remains the source of truth.

## Abandon Rules

A player is treated as `abandoned` when:

- the reconnect timer expires during a live match
- a future explicit forfeit action is added and used

When a player becomes abandoned in MVP:

- the player is eliminated from active participation
- the player is removed from future turn order
- all owned properties return to the bank as unowned
- the player may still receive a final result view if reconnecting later is supported at the frontend level

Reason:

- this mirrors bankruptcy-style simplification
- it avoids asset transfer and manual recovery complexity

## End-Game Interaction with Failure Rules

After a disconnect timeout or abandonment event, the server must check:

- how many non-bankrupt and non-abandoned players remain
- whether only one player is still active

If only one active player remains:

- the match ends immediately
- that player is declared the winner

## Invalid or Duplicate Join/Rejoin Cases

The server should reject:

- reconnect attempts for players with no reserved slot
- new players trying to join a match already in `playing`
- reconnect attempts after the reconnect window expired
- duplicate connections attempting to control the same active player slot unless the old session is intentionally replaced

## Server Failure Limitation for MVP

The MVP does not need full crash recovery for in-progress matches.

If the game server process restarts unexpectedly during a live match:

- the live match may be treated as terminated
- automatic resume is deferred beyond MVP

Reason:

- persistence and room recovery after crash add significant complexity
- reconnect within the same healthy server process is enough for MVP

## Logging Expectations for Later Phases

Even in MVP, the server should log:

- disconnect time
- reconnect time
- reconnect timeout expiry
- player abandonment
- auto-resolved idle turns
- canceled start attempts

These logs will help debugging and balancing later.

## Step 5 Deliverables

This step should produce:

- reconnect window definition
- room transfer timeout definition
- idle timeout definition
- clear active-player disconnect behavior
- clear non-active-player disconnect behavior
- abandonment behavior
- known limitations for server crash recovery

## Exit Criteria

Step 5 is complete when:

- a disconnect no longer creates undefined match behavior
- idle players no longer block the game forever
- reconnect behavior is explicit
- abandon outcomes are explicit
- Phase 2 can model connection and timeout state cleanly

## Notes for Later Steps

- Phase 2 should model player connection status and pause reason fields where needed
- later phases may add richer surrender, moderation, and crash recovery flows
