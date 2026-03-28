# Phase 6 - Pure Game Engine

## Purpose

Phase 6 builds the Monopoly gameplay rules as a pure TypeScript engine before wiring them into Colyseus rooms.

This phase is where the project turns the approved MVP rules and domain design into deterministic rule execution that can later power the real-time multiplayer runtime.

## Phase 6 Goal

Create a clean and implementation-ready pure game engine for:

- turn progression
- dice rolling and movement resolution
- tile resolution
- property purchase and rent handling
- jail handling
- bankruptcy handling
- deterministic game state transitions that can be tested independently from transport and persistence

## Inputs from Previous Phases

Phase 6 must respect the approved outcomes from earlier phases, including:

- MVP rules and edge-case decisions from Phase 1
- domain model, state model, command contracts, and board config design from Phase 2
- runnable workspace and shared package structure from Phase 3
- PostgreSQL and persistence baselines from Phase 4
- Phase 5 API work, while keeping the game engine fully decoupled from request-path API logic

## Required End State for Phase 6

By the end of Phase 6:

- `packages/game-engine` should contain real gameplay rule logic
- the engine should be pure and deterministic from input state and command to output state/result
- the engine should not depend on React, Fastify, Prisma, or Colyseus runtime classes
- the engine should be ready to plug into Phase 7 room handlers
- the engine should have initial automated tests for critical rule flows
- the workspace should remain typecheck- and build-clean

## Phase 6 Deliverables

By the end of Phase 6, the project should have:

- game engine scope and purity-boundary documentation
- engine state and action model for package-level use
- board navigation and tile resolution helpers
- turn progression logic
- economy and bankruptcy logic
- jail handling logic
- rule-oriented tests for the implemented engine flows
- verification notes and Phase 6 sign-off

## Recommended Step Order

### Step 1 - Engine Scope and Purity Boundaries

Focus:

- define what belongs inside the pure engine
- define what must stay outside in Colyseus or the API layer
- define the shape of engine inputs, outputs, and side effects

Output:

- engine scope document
- purity and dependency rules

### Step 2 - Engine Package Contracts and Core Types

Focus:

- define the engine-facing state, action, and result types
- define deterministic transition inputs and outputs
- align package contracts with approved Phase 1 and Phase 2 rules

Output:

- engine contract document
- shared game-engine types scaffold

### Step 3 - Dice, Turn, and Movement Logic

Focus:

- implement dice handling
- implement turn progression flow
- implement board movement and passing start salary behavior

Output:

- turn and movement engine functions

### Step 4 - Tile Resolution and Economy Logic

Focus:

- resolve tile outcomes for property, tax, free parking, jail, go to jail, and neutral tiles
- implement property purchase eligibility and rent application
- implement money movement and start salary handling

Output:

- tile and economy rule functions

### Step 5 - Jail and Bankruptcy Logic

Focus:

- implement simplified MVP jail behavior
- implement bankruptcy and elimination handling
- update turn order and active-player behavior after elimination

Output:

- jail and bankruptcy rule functions

### Step 6 - Engine Tests and Verification

Focus:

- add tests for the implemented rule flows
- verify deterministic outcomes for key scenarios
- confirm package build and type health

Output:

- test suite baseline
- verification notes

### Step 7 - Sign-Off

Focus:

- confirm the engine is ready for Colyseus integration
- document any remaining rule gaps or runtime integration assumptions

Output:

- Phase 6 sign-off document

## Working Principles for Phase 6

- keep the engine pure and side-effect free
- avoid coupling engine code to room state classes, HTTP request objects, or database models
- prefer explicit input and output data over hidden mutation through globals or singletons
- keep randomness injectable so tests and room integration can control dice results deterministically
- keep engine logic aligned with the simplified MVP rules already approved in Phase 1
- treat the engine as the rule authority that Colyseus will later orchestrate, not replace

## Planned In-Scope Engine Areas

The first implementation wave of Phase 6 should focus on:

- turn lifecycle
- movement and start salary
- basic tile resolution
- property buying
- rent and tax handling
- jail simplified rules
- bankruptcy handling

## Explicitly Deferred or Limited Areas

The following areas are not the primary target of the first Phase 6 implementation wave:

- chance and community chest card systems
- mortgage, trade, houses, and hotels
- advanced auction flows
- AI or bot behavior
- persistence writes from inside the engine
- room/session lifecycle handling

These remain outside the pure engine or belong to later gameplay phases.

## Expected Handoff After Phase 6

Once Phase 6 is complete, the project should be ready to continue with:

- Colyseus room integration in Phase 7
- deterministic server-side command handling on top of the pure engine
- frontend playback of engine-driven match state changes once room integration begins