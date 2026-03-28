# Phase 3 - Runtime Setup, Shared Scaffolding, and Build Readiness

## Purpose

Phase 3 turns the signed-off modeling baseline from Phase 2 into a runnable and buildable project foundation.

This phase is no longer only about folder scaffolding. By the end of Phase 3, the workspace should have the required runtime tooling, package setup, shared contracts, static game data, and baseline application entry points so the project can install dependencies and build successfully.

## Phase 3 Goal

Create a clean and build-ready project foundation for:

- frontend web app
- backend API
- Colyseus game server
- shared types and enums
- shared board configuration
- initial room state scaffolding
- runtime tooling and build scripts

## Inputs from Phase 2

Phase 3 must respect all approved Phase 2 models, including:

- domain model boundaries
- `LobbyRoom` and `MonopolyRoom` separation
- room state structure
- command contracts
- event and payload model
- classic 40-tile board configuration model

## Required End State for Phase 3

By the end of Phase 3:

- `npm install` should work for the workspace
- runtime dependencies for `web`, `api`, and `game-server` should be in place
- shared packages should be importable across the workspace
- the project should expose valid build scripts
- `npm run build` should succeed at the workspace level
- the project should be ready to begin feature implementation on top of a real runtime foundation

## Phase 3 Deliverables

By the end of Phase 3, the project should have:

- workspace or monorepo folder structure
- initial package boundaries
- TypeScript base setup
- shared enums and common type definitions
- initial board config files
- runtime setup for the web app
- runtime setup for the API app
- runtime setup for the Colyseus game server
- initial Colyseus schema scaffolding
- room handler scaffolding
- working install and build scripts
- successful build verification

## Recommended Step Order

### Step 1 - Project Structure and Package Boundaries

Focus:

- define and scaffold folder layout
- define responsibilities for `web`, `api`, `game-server`, and shared packages
- define what code belongs where before implementation grows

Output:

- project structure document
- initial workspace skeleton

### Step 2 - TypeScript and Shared Types Scaffolding

Focus:

- set up base TypeScript configuration
- define shared enums, IDs, DTOs, and command/event payload types

Output:

- shared types document
- initial shared type source files

### Step 3 - Board Config and Static Game Data Scaffolding

Focus:

- scaffold classic board config source files
- define how static game data is loaded and shared

Output:

- board scaffolding document
- initial classic board config source files

### Step 4 - Web Runtime Setup

Focus:

- set up the `web` app with its actual runtime stack
- install and configure Vite, React, and React DOM
- add the required app entry files so the frontend can build

Output:

- runtime-ready `apps/web`
- buildable frontend baseline

### Step 5 - API and Game Server Runtime Setup

Focus:

- set up the `api` app runtime
- set up the `game-server` app runtime
- establish real dev/build scripts for both server-side apps

Output:

- runtime-ready `apps/api`
- runtime-ready `apps/game-server`
- server build baseline

### Step 6 - Colyseus Schema and Room Skeleton Scaffolding

Focus:

- scaffold `LobbyRoomState` and `MonopolyRoomState`
- scaffold nested state classes for players, board, turn, jail, connection, and results
- scaffold room classes and handler placeholders against the real runtime

Output:

- schema scaffolding document
- room and schema baseline source files

### Step 7 - Install and Build Verification

Focus:

- run dependency installation for the workspace
- fix package or config issues that block installation or builds
- run workspace build verification

Output:

- successful `npm install`
- successful `npm run build`
- notes on any remaining non-blocking follow-up items

### Step 8 - Phase 3 Sign-Off

Focus:

- freeze setup direction after verifying runtime and build readiness

Output:

- Phase 3 sign-off document

## Working Principles for Phase 3

- scaffold for clarity, but do not stop at placeholders when runtime setup is required
- keep modules aligned with approved domain boundaries
- avoid mixing persistence code into room logic
- avoid coupling frontend UI code to server implementation details
- prefer shared contracts for cross-app communication
- ensure every setup decision improves buildability, not just structure

## Expected Handoff After Phase 3

Once Phase 3 is complete, the project should be ready to start implementation work on:

- API foundation
- lobby flow
- board config usage
- game engine package
- Colyseus room logic
- frontend integration

without needing to reopen runtime or workspace setup first.