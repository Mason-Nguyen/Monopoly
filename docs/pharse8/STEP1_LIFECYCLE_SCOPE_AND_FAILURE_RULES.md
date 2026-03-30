# Phase 8 - Step 1: Lifecycle Scope and Failure Rules

## Objective

Define the lifecycle semantics for live multiplayer rooms so disconnects, reconnects, consented leaves, and inactivity all produce predictable outcomes without undermining the gameplay authority already established in Phase 7.

This step does not change code yet. It locks the rules and ownership boundaries that the rest of Phase 8 will implement.

## Why This Step Exists

`MonopolyRoom` already has a baseline disconnect and reconnect implementation, but it is still partial:

- temporary disconnects reserve the slot
- reconnect changes connection flags
- consented leave and reconnect expiry mark the player as abandoned in schema state

What is still missing is a complete answer to:

- when a lifecycle outcome should stay as room-only transport state
- when it should become an authoritative gameplay outcome
- how active turns behave while a player is temporarily gone
- how to avoid schema-only lifecycle mutations diverging from engine truth

## Current Baseline from Earlier Phases

Approved rules already exist from Phase 1:

- reconnect window: `90s`
- lobby-to-match transfer timeout: `30s`
- idle turn timeout: `60s`
- active player disconnect pauses the turn temporarily
- non-active player disconnect does not pause the whole match
- reconnect expiry should result in abandonment

Approved architecture also exists from Phase 7:

- gameplay rules belong to `packages/game-engine`
- runtime transport and connection handling belong to `MonopolyRoom`
- schema state is authoritative for synchronized clients
- room lifecycle outcomes should not stay as ad-hoc schema-only mutations forever

## Lifecycle Terms for Phase 8

### Temporary Disconnect

A player loses the socket connection but still owns the seat in the room for the reconnect window.

Expected state:

- `connection.status = disconnected_reserved`
- reconnect deadline is set
- player is not yet eliminated
- player data and seat ownership remain intact

### Reconnect

The same player reclaims the reserved slot before the reconnect window expires.

Expected state:

- `connection.status` becomes `reconnected` and then effectively `connected` for continued play
- reconnect deadline is cleared
- no gameplay elimination occurs
- match truth stays continuous

### Abandonment

A player permanently fails to return before the reconnect deadline, or intentionally leaves during an active match in a way that counts as forfeiting participation.

Expected gameplay meaning:

- player is removed from active competition
- the outcome must become authoritative match state
- if the abandonment changes who remains active, match-end resolution may follow

### Consented Leave

A player intentionally leaves via a clean client action during an active match.

Expected MVP meaning:

- treat as abandonment during active match
- treat as a simple room exit before match start or outside active gameplay

### Idle Timeout

The active player remains connected but does not provide input before the approved turn deadline.

Expected MVP behavior:

- if waiting for a dice roll: auto-roll
- if waiting for optional purchase: auto-skip purchase
- if waiting for end turn: auto-end turn

## Lifecycle Ownership Boundaries

### Room-Owned Concerns

These remain runtime concerns of the Colyseus room layer:

- socket presence
- reconnect reservation window
- reconnect deadline timers
- client identity and reservation matching
- broadcasting connection-status UX events
- scheduling idle-turn timers

### Engine-Owned Concerns

These remain gameplay concerns of the pure engine:

- who is still an active competitor
- whether a player is effectively eliminated from the match
- whether abandonment ends the match
- resulting winner and end reason
- turn advancement after lifecycle outcomes that affect active competition

### Integration Rule

A lifecycle outcome may begin in the room layer, but once it changes active competition it must be converted into authoritative gameplay state.

That means:

- temporary disconnect remains room-only
- reconnect remains room-only
- abandonment and active-match forfeit must not remain only a connection flag

## Approved MVP Failure Rules

### Rule 1 - Temporary Disconnect Does Not Immediately Eliminate

If a player disconnects during an active match:

- reserve the slot for the reconnect window
- keep gameplay identity intact
- do not immediately eliminate the player

### Rule 2 - Reconnect Expiry Becomes Abandonment

If the reconnect window expires:

- the player becomes abandoned
- abandonment must become authoritative match state, not only schema transport state
- match resolution must continue from that authoritative outcome

### Rule 3 - Consented Leave During Active Match Equals Abandonment

If a player leaves a live match intentionally:

- treat it as abandonment for MVP
- resolve it the same way as reconnect expiry from the perspective of competition

### Rule 4 - Active Player Disconnect Temporarily Pauses Input Progress

If the active player disconnects:

- no new gameplay command should be accepted from that player until reconnect or expiry resolution
- the room may temporarily wait for reconnect rather than instantly auto-resolving the turn
- once expiry happens, the match should continue from the authoritative abandonment outcome

### Rule 5 - Non-Active Player Disconnect Does Not Pause the Match

If a non-active player disconnects:

- keep the match running
- preserve their reserved slot for the reconnect window
- resolve to abandonment only if the reconnect deadline expires

### Rule 6 - Idle Timeout Is Not Abandonment

If the active player stays connected but does not act:

- resolve the turn using approved auto-actions
- do not mark the player abandoned just because they were idle for one turn

### Rule 7 - Match Truth Must Be Recoverable from Schema State

After any lifecycle resolution:

- synchronized schema state must reflect the current authoritative outcome
- reconnecting clients must not depend on past ephemeral events to recover the match truth

## Scope Split Between LobbyRoom and MonopolyRoom

### LobbyRoom

In Phase 8, `LobbyRoom` is secondary.

Baseline lifecycle rules there are simpler:

- disconnected players can simply leave or rejoin before match start
- host departure and start-flow hardening may be revisited later

### MonopolyRoom

`MonopolyRoom` is the main target of Phase 8.

This is where lifecycle outcomes matter most because they can change:

- active competition
- turn progression
- match completion
- result persistence readiness

## Implementation Implications for Next Steps

This step implies the next implementation steps should do the following:

- define a clean room-to-engine abandon action path
- centralize reconnect-expiry handling instead of mutating schema ad hoc in multiple places
- keep connection UX events, metadata, and authoritative state updates aligned
- introduce idle-turn scheduling without mixing timer concerns into the engine package

## Exit Criteria

Step 1 is complete when:

- lifecycle terms are defined clearly
- room-versus-engine ownership is explicit
- disconnect, reconnect, abandonment, leave, and idle rules are approved for MVP
- Step 2 can design reconnect reservation flow without ambiguity
