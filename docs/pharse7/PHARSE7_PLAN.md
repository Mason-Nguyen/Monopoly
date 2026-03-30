# Phase 7 - Colyseus Engine Integration

## Purpose

Phase 7 connects the pure gameplay engine from Phase 6 into the live Colyseus runtime so room handlers stop using placeholder gameplay mutations and start delegating authoritative gameplay transitions to `packages/game-engine`.

This phase is where the project turns the engine into the actual multiplayer rule authority that powers `MonopolyRoom` during real matches.

## Phase 7 Goal

Create a clean and implementation-ready integration layer between:

- `packages/game-engine`
- `apps/game-server/src/rooms/MonopolyRoom.ts`
- `apps/game-server/src/handlers/game.ts`
- Colyseus schema state and event broadcasting

By the end of this phase, gameplay commands in the active match room should execute through the pure engine instead of direct ad-hoc room mutations.

## Inputs from Previous Phases

Phase 7 must respect the approved outcomes from earlier phases, including:

- MVP rules and edge-case decisions from Phase 1
- domain model, room-state design, command contracts, and event payload design from Phase 2
- runnable Colyseus room and schema scaffolding from Phase 3
- persistence and API baselines from Phase 4 and Phase 5
- pure gameplay engine implementation and tests from Phase 6

## Required End State for Phase 7

By the end of Phase 7:

- `MonopolyRoom` command handlers should route gameplay actions through `packages/game-engine`
- Colyseus room state should remain the live synchronized source for clients
- engine transitions should drive schema mutations and room broadcast events
- room transport concerns should remain outside the pure engine
- the workspace should remain typecheck-, test-, and build-clean

## Phase 7 Deliverables

By the end of Phase 7, the project should have:

- room-integration scope and authority-boundary documentation
- engine-to-schema mapping strategy
- match initialization flow from room options into engine initial state
- real gameplay command execution pipeline in `MonopolyRoom`
- engine-event-to-room-broadcast mapping
- verification notes for local room integration behavior
- Phase 7 sign-off

## Recommended Step Order

### Step 1 - Room Integration Scope and Authority Boundaries

Focus:

- define what belongs in `MonopolyRoom` versus `packages/game-engine`
- define how commands move from client message to engine action to schema patch
- define where timers, reconnect logic, and broadcast behavior stay

Output:

- room integration scope document
- authority-boundary rules for runtime orchestration

### Step 2 - Engine State to Colyseus Schema Mapping Strategy

Focus:

- map engine state into `MonopolyRoomStateSchema`
- define conversion rules between engine shapes and schema classes
- decide where one-way projection helpers should live

Output:

- mapping strategy document
- projection helper baseline

### Step 3 - Match Initialization Flow

Focus:

- initialize live room state from approved board config and player join data
- connect room creation flow to `createInitialMatchState()`
- align room startup with authoritative engine turn order and balances

Output:

- match initialization implementation
- room creation helpers for engine-backed setup

### Step 4 - Gameplay Command Execution Pipeline

Focus:

- replace placeholder command logic in `apps/game-server/src/handlers/game.ts`
- execute `roll_dice`, `buy_property`, and `end_turn` through the engine
- translate client identity and command payloads into engine actions

Output:

- engine-backed gameplay handlers
- command-to-engine translation helpers

### Step 5 - Engine Event Broadcast and Schema Sync

Focus:

- map engine events into Colyseus room broadcasts
- keep schema state and broadcast payloads aligned after each transition
- preserve the approved separation between authoritative state sync and UX-oriented events

Output:

- event broadcasting integration
- schema update and broadcast mapping helpers

### Step 6 - Verification and Runtime Notes

Focus:

- verify local room behavior with engine-backed commands
- confirm workspace health after integration changes
- document remaining runtime gaps that are intentionally deferred

Output:

- verification notes
- integration caveat list

### Step 7 - Sign-Off

Focus:

- confirm the game server is ready for richer multiplayer/runtime work on top of engine-backed command handling
- document the approved handoff into the next phase

Output:

- Phase 7 sign-off document

## Working Principles for Phase 7

- `packages/game-engine` remains the gameplay rule authority
- `MonopolyRoom` remains the transport/runtime authority
- clients never calculate authoritative gameplay outcomes
- room handlers should prefer translating commands and applying engine results over mutating room state ad hoc
- room state synchronization and event broadcasting must stay consistent with engine output
- persistence writes remain outside the immediate command loop unless explicitly added later

## Planned In-Scope Areas

The first implementation wave of Phase 7 should focus on:

- engine-backed command handling in `MonopolyRoom`
- schema projection from engine state
- engine event broadcasting through Colyseus
- initial room verification for core gameplay flows

## Explicitly Deferred or Limited Areas

The following areas are not the primary target of Phase 7:

- full lobby-to-match production flow polish
- PostgreSQL write-side persistence of completed match outcomes
- abandonment driven by real reconnect timeout expiry wired all the way into engine elimination
- frontend animation playback tuning
- chance/community chest, mortgage, trade, houses, and hotels

## Expected Handoff After Phase 7

Once Phase 7 is complete, the project should be ready to continue with:

- richer multiplayer runtime behavior on top of engine-backed rooms
- match persistence after real gameplay completion
- frontend integration against authoritative room gameplay events and synchronized state

