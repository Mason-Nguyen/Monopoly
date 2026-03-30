# Phase 8 - Reconnect and Room Lifecycle

## Purpose

Phase 8 hardens live room behavior so the multiplayer runtime can survive real user disconnects, reconnects, consented leaves, inactivity, and room lifecycle edge cases without breaking authoritative gameplay state.

This phase builds directly on Phase 7, where gameplay command execution was already moved into the pure engine. Phase 8 is where room lifecycle events become reliable enough for real player sessions.

## Phase 8 Goal

Create a consistent room lifecycle model for `LobbyRoom` and `MonopolyRoom` that:

- preserves temporary reconnect windows
- resolves abandonment and leave outcomes deterministically
- keeps Colyseus runtime concerns separate from pure gameplay rules
- wires room lifecycle outcomes into authoritative match state when required
- remains typecheck-, test-, and build-clean

## Inputs from Previous Phases

Phase 8 must respect the approved outcomes from earlier phases, including:

- Phase 1 disconnect, timeout, and abandonment rules
- Phase 2 room-state and event-payload design
- Phase 3 Colyseus room/runtime scaffolding
- Phase 6 pure engine jail, bankruptcy, and match-end logic
- Phase 7 engine-backed room integration and gameplay event broadcasting

## Required End State for Phase 8

By the end of Phase 8:

- reconnect and reserved-slot behavior should be explicit and documented
- temporary disconnects should not immediately destroy authoritative match continuity
- permanent leave or reconnect expiry should resolve into authoritative room outcomes
- active-match lifecycle changes should no longer live as ad-hoc schema-only mutations
- runtime verification notes should cover disconnect, abandon, and idle scenarios

## Phase 8 Deliverables

By the end of Phase 8, the project should have:

- room lifecycle scope and failure-rule documentation
- reconnect reservation flow design
- authoritative abandon/leave integration strategy
- implementation for disconnect expiry and abandon handling in live rooms
- idle and timeout handling baseline for MVP behavior
- verification notes for lifecycle scenarios
- Phase 8 sign-off

## Recommended Step Order

### Step 1 - Lifecycle Scope and Failure Rules

Focus:

- define what counts as temporary disconnect, reconnect, abandonment, idle timeout, and consented leave
- define which outcomes belong to runtime orchestration versus engine authority
- define expected behavior before and during an active match

Output:

- lifecycle scope document
- approved failure semantics for room behavior

### Step 2 - Reconnect Reservation and Recovery Flow

Focus:

- define reconnect window behavior
- define reserved-slot ownership and reclaim rules
- clarify how clients re-enter the same room safely

Output:

- reconnect flow document
- reservation-state design

### Step 3 - Authoritative Abandon and Leave Integration Strategy

Focus:

- define how room lifecycle outcomes become authoritative match outcomes
- decide how abandon maps into engine-driven elimination and match-end handling
- avoid schema-only divergence from gameplay truth

Output:

- abandon/leave integration design
- room-to-engine lifecycle action strategy

### Step 4 - Disconnect and Abandon Implementation

Focus:

- wire disconnect expiry and consented leave into authoritative room behavior
- update runtime handling in `MonopolyRoom`
- keep room state, metadata, and broadcasts aligned

Output:

- hardened disconnect and abandon implementation
- updated room lifecycle flow in code

### Step 5 - Idle Timeout and Turn Deadline Baseline

Focus:

- implement MVP idle behavior for active turns
- define what auto-actions are allowed when a player does not respond
- keep idle resolution consistent with earlier approved MVP rules

Output:

- idle timeout baseline
- turn-deadline handling notes and code

### Step 6 - Verification and Runtime Notes

Focus:

- verify disconnect, reconnect, abandon, and idle flows locally
- confirm workspace health after lifecycle changes
- document remaining runtime gaps that are still intentionally deferred

Output:

- verification notes
- lifecycle caveat list

### Step 7 - Sign-Off

Focus:

- confirm the room runtime is ready for real-session behavior on top of engine-backed gameplay
- document the approved handoff into the next implementation phase

Output:

- Phase 8 sign-off document

## Working Principles for Phase 8

- gameplay rule outcomes stay authoritative in `packages/game-engine`
- transport and reconnect mechanics stay in the Colyseus room layer
- lifecycle events should not silently desync schema state from gameplay truth
- temporary disconnects must preserve continuity when possible
- permanent disconnect outcomes must resolve explicitly and predictably
- clients should always be able to recover match truth from synchronized room state

## Planned In-Scope Areas

The first implementation wave of Phase 8 should focus on:

- `MonopolyRoom` disconnect, reconnect, leave, and abandon behavior
- reserved-slot lifecycle during active matches
- idle turn handling for MVP
- verification of runtime lifecycle behavior

## Explicitly Deferred or Limited Areas

The following areas are not the primary target of Phase 8:

- Redis-backed multi-instance scaling
- full lobby-to-match transfer polish across distributed servers
- frontend UI polish for reconnect banners and countdowns
- production-grade moderation, reconnect-token hardening, and anti-abuse measures
- non-MVP gameplay systems such as chance, community chest, mortgage, trade, houses, and hotels

## Expected Handoff After Phase 8

Once Phase 8 is complete, the project should be ready to continue with:

- richer end-to-end frontend integration against real room lifecycle behavior
- persistence of completed match outcomes from live rooms
- more realistic multiplayer testing beyond local smoke flows
