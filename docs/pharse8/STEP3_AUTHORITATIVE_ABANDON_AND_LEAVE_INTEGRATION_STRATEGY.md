# Phase 8 - Step 3: Authoritative Abandon and Leave Integration Strategy

## Objective

Define how room lifecycle outcomes such as reconnect expiry and consented leave become authoritative match outcomes instead of remaining schema-only connection mutations.

This step bridges the gap between:

- room-owned transport lifecycle events
- engine-owned competitive elimination and match-end truth

## Why This Step Exists

Current runtime behavior in `MonopolyRoom` still has an important weakness:

- reconnect expiry sets `player.isAbandoned = true` directly in schema state
- consented leave during a live match does the same
- no engine transition is executed for these lifecycle outcomes
- turn advancement and match-end resolution are therefore not guaranteed to follow the same authoritative path as bankruptcy or other gameplay outcomes

That creates a risk of divergence between:

- connection flags in room schema
- active competition truth in the engine model

Phase 8 Step 3 closes that gap by defining the authoritative integration strategy before implementation.

## Core Strategy

### Principle 1 - Lifecycle Trigger Starts in the Room Layer

The room detects transport/runtime facts such as:

- reconnect window expired
- player consented leave during active match
- future server-side forfeit or moderation outcome

These triggers originate in `MonopolyRoom`, not in the pure engine.

### Principle 2 - Competitive Consequences Must Be Resolved Through the Engine

Once a lifecycle trigger changes who is still competing in the match, the room must stop mutating schema state ad hoc and instead resolve the consequence through an authoritative engine lifecycle transition.

That means:

- `abandoned` is not just a connection status
- it is a gameplay elimination outcome
- match-end logic after abandonment must come from engine-owned rules

### Principle 3 - Schema State Must Be a Projection of the Authoritative Outcome

After the room resolves lifecycle consequences through the engine:

- the updated engine state is applied back into Colyseus schema
- room metadata is refreshed
- UX-oriented broadcasts are emitted from the resulting authoritative event list

## Recommended Lifecycle Integration Shape

### Separate Lifecycle Path from Gameplay Commands

Abandonment and leave should not be modeled as normal client gameplay commands.

Reason:

- they are not voluntary turn actions like `roll_dice`, `buy_property`, or `end_turn`
- they may originate from server timers and transport events
- they must be allowed to affect players who are not the active player
- they should not be blocked by normal turn-phase validation rules

### Recommended Design

Keep two distinct entry paths in the room layer:

- gameplay command path
- lifecycle outcome path

Gameplay command path:

- client message
- payload validation
- engine command transition
- schema projection
- gameplay event broadcast

Lifecycle outcome path:

- room detects lifecycle trigger
- lifecycle validation
- engine lifecycle transition
- schema projection
- connection and gameplay event broadcast

## Recommended Engine Extension Approach

### Do Not Overload Existing `EngineAction`

Current `EngineAction` only models client-driven gameplay actions:

- `roll_dice`
- `buy_property`
- `end_turn`

These are all active-player actions and do not describe room lifecycle outcomes well.

### Recommended Addition

Introduce a separate pure engine lifecycle transition API for server-originated outcomes.

Recommended shape:

```ts
applyEngineLifecycleOutcome({
  state,
  boardConfig,
  outcome: {
    type: "abandon_player",
    playerId,
    reason: "abandoned",
    now
  }
})
```

Equivalent naming would also be acceptable, for example:

- `applyEngineSystemAction(...)`
- `resolveEngineLifecycleEvent(...)`
- `abandonPlayerInEngineState(...)`

The important rule is architectural, not naming-specific:

- server-originated lifecycle resolution should be pure and engine-owned
- it should not be forced through the client command contract

## Required Behavior of the Engine Lifecycle Outcome

For an abandonment outcome during a live match, the engine-side behavior should be:

1. locate the player by `playerId`
2. if the player is already eliminated, treat the outcome as idempotent or reject cleanly
3. eliminate the player with reason `abandoned`
4. release owned properties back to bank ownership
5. if that player was active, advance turn or finish match as needed
6. if that player was not active, preserve current turn unless match-end is triggered
7. if one active player remains, finish the match authoritatively
8. return structured engine events such as:
   - `player_eliminated`
   - `turn_advanced` when relevant
   - `match_ended` when relevant

## Room-to-Engine Lifecycle Flow for MVP

### Case 1 - Reconnect Expiry During Active Match

Recommended flow:

1. room detects reconnect expiry
2. room marks connection UX intent as `abandoned`
3. room invokes engine lifecycle resolution for that player
4. engine returns authoritative elimination outcome
5. room projects engine state into schema
6. room emits:
   - `game:playerConnectionChanged`
   - engine-derived gameplay broadcasts such as `game:playerEliminated`
   - `game:resultReady` if match ends

### Case 2 - Consented Leave During Active Match

Recommended flow:

1. room receives consented leave
2. room treats it as active-match abandonment
3. room invokes the same engine lifecycle resolution path as reconnect expiry
4. room applies the same schema projection and event broadcast flow

Important rule:

- reconnect expiry and consented leave should converge on the same authoritative abandon handler

### Case 3 - Disconnect Without Expiry Yet

Recommended flow:

1. room marks the player `disconnected_reserved`
2. room sets reconnect deadline
3. room emits only connection-status UX event
4. no engine elimination happens yet

This keeps temporary disconnect separate from permanent competition loss.

## Join and Match-State Boundaries

### Match Status `playing`

For active matches:

- reconnect expiry and consented leave must use the authoritative abandon path
- no direct schema-only `isAbandoned` mutation should be treated as final truth anymore

### Match Status `finished`

If the match is already finished:

- lifecycle events may still affect connection UX state
- they should not reopen or re-resolve match outcomes

### Match Status Outside Active Match

Before the match becomes `playing`:

- leave or disconnect may remain room-owned cleanup behavior
- no engine lifecycle resolution is necessary

## Event and Broadcast Alignment

The authoritative abandon path should keep two classes of broadcasts aligned:

### Connection UX Event

The room should continue to emit:

- `game:playerConnectionChanged`

This communicates socket and reservation status.

### Competitive Outcome Events

The room should also emit engine-derived gameplay events when abandonment becomes authoritative:

- `game:playerEliminated`
- `game:resultReady` when relevant
- state-driven turn updates through synchronized room state

This preserves the Phase 2 rule that state is authoritative and explicit events are UX helpers.

## Idempotency Rule

The authoritative abandon handler should be safe against repeated triggers.

That means:

- if a player is already abandoned and resolved authoritatively, repeated expiry/leave handling should not re-eliminate them
- duplicate lifecycle handling should either:
  - no-op safely, or
  - fail in a predictable, explicitly handled way

The preferred MVP direction is idempotent no-op behavior where practical.

## Recommended Implementation Shape for Step 4

Step 4 should likely introduce:

- a room service such as `resolvePlayerAbandonment(room, playerId, cause)`
- an engine pure helper or lifecycle transition entry point
- shared broadcast handling that reuses the Phase 7 event broadcaster after engine resolution

Recommended orchestration sequence:

1. validate the player exists and the match is still `playing`
2. ensure the lifecycle trigger still applies
3. execute authoritative engine abandonment resolution
4. apply projected engine state to schema
5. update connection state and metadata
6. emit connection event and gameplay broadcasts

## Explicitly Deferred in This Step

This step does not yet implement:

- actual room code changes
- idle timeout logic
- stronger reconnect token hardening
- spectator or post-match result-only reconnect flow

## Exit Criteria

Step 3 is complete when:

- the project has a clear authoritative path for abandonment and live-match leave outcomes
- room-owned lifecycle detection is separated from engine-owned competitive resolution
- the next implementation step can wire disconnect expiry and consented leave without ambiguity

