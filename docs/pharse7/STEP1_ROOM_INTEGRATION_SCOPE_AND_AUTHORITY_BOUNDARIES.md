# Phase 7 - Step 1: Room Integration Scope and Authority Boundaries

## Objective

Define the runtime boundary between the pure gameplay engine and the Colyseus room layer before wiring real engine-backed gameplay into `MonopolyRoom`.

This step exists to prevent gameplay rules from leaking back into room handlers now that the pure engine is ready.

## Current Starting Point

The project already has:

- a real pure gameplay engine in `packages/game-engine`
- real Colyseus room and schema scaffolding in `apps/game-server`
- placeholder gameplay command handling in `apps/game-server/src/handlers/game.ts`
- a `MonopolyRoom` skeleton with connection lifecycle hooks and schema state

This means Phase 7 does not need to redesign gameplay rules again.

It needs to connect the already-approved engine into the live room runtime cleanly.

## Core Authority Split

### `packages/game-engine`

The engine owns:

- gameplay rule validation
- deterministic dice resolution
- movement and tile resolution
- economy outcomes
- jail behavior
- bankruptcy and match-end outcomes
- engine events describing what happened during a transition

The engine must not own:

- Colyseus client/session objects
- room metadata and matchmaking behavior
- reconnect timers and `allowReconnection()` orchestration
- network transport concerns
- schema mutation mechanics
- direct persistence writes

### `MonopolyRoom` and Game Handlers

The room layer owns:

- client identity and session mapping
- transport-level validation such as "which client sent this message"
- room lifecycle hooks like `onJoin`, `onDrop`, `onReconnect`, `onLeave`
- timer management and reconnect policy
- converting schema state into engine input and applying engine results back into schema state
- broadcasting approved room events to connected clients

The room layer must not re-implement gameplay rules that already exist in the engine.

## Command Pipeline Boundary

For gameplay commands, the room flow should be:

1. receive Colyseus message in `MonopolyRoom`
2. validate sender identity and transport-level preconditions
3. build engine action input
4. project current room state into engine state input if needed
5. call `applyEngineAction()`
6. project the resulting engine state back into Colyseus schema state
7. broadcast engine-derived gameplay events to clients
8. schedule or update room-runtime timers only if needed

The room should not mutate gameplay state first and then call the engine as a secondary check.

The engine call must be the authority.

## Schema and Engine Relationship

During active gameplay:

- Colyseus schema state remains the synchronized live state for clients
- engine state remains the deterministic rule-transition model
- the room is responsible for translating between the two consistently

This means:

- clients read synchronized room state
- the room uses engine transitions to decide what the next authoritative state should be
- the room then applies that result into schema state and broadcasts related UX events

## Event Boundary

Engine events should become room broadcasts only after the engine transition succeeds.

Room broadcasts should be treated as:

- UX-oriented notifications for the client
- animation and feedback triggers
- a mirror of successful authoritative engine results

They are not the source of truth.

The source of truth for clients remains the patched Colyseus schema state.

## What Step 1 Locks In

After Step 1, the project should treat the following as fixed integration rules:

- gameplay rules live in `packages/game-engine`
- room/session/runtime rules live in `apps/game-server`
- gameplay commands must execute through the engine
- schema mutations must reflect engine output, not replace it
- reconnect and timer policies remain room concerns unless explicitly promoted into the engine later

## Immediate Next Design Target

With the authority boundary locked, the next design step should define the exact mapping strategy between:

- `EngineMatchState`
- `MonopolyRoomStateSchema`
- engine events
- room broadcasts

That is the purpose of Phase 7 Step 2.
