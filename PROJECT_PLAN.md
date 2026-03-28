# Monopoly Web Game - Tech Stack and Implementation Plan

## Project Goal

Build a browser-based Monopoly-style game for 4-6 players with:

- Frontend in React
- Real-time multiplayer using Colyseus
- Backend in Node.js
- Persistent storage in PostgreSQL
- 2.5D visuals for the game board and player tokens

This document is the baseline reference for architecture, tech choices, and implementation phases before starting Phase 1.

## Final Tech Stack

### Frontend

- React
- Vite
- TypeScript
- React Router
- Zustand
- TanStack Query
- React Hook Form
- Zod

### 2.5D Rendering and Animation

- three
- @react-three/fiber
- @react-three/drei
- framer-motion
- Optional: @react-spring/three for board and token motion

### Backend API

- Node.js
- NestJS
- Prisma
- PostgreSQL
- Zod
- Pino
- Swagger / OpenAPI

### Real-time Game Server

- Colyseus
- @colyseus/schema
- Colyseus JavaScript client

### Scaling and Infrastructure

- Redis
- @colyseus/redis-presence

### Testing

- Vitest
- Playwright

## Why This Stack

### React + Vite

- Fast development workflow
- Good fit for interactive UI and game dashboards
- Easy integration with 3D libraries and real-time clients

### Colyseus

- Designed for authoritative multiplayer game rooms
- Handles room lifecycle and state synchronization well
- Better fit than generic websocket tooling for turn-based game state

### PostgreSQL

- Strong fit for relational data such as users, matches, rooms, and leaderboards
- Works very well with Prisma
- Can store snapshots or event metadata when needed using JSONB

### Redis

- Used for Colyseus presence and scaling across multiple processes or servers
- Not required at the earliest local MVP stage, but should be part of the production plan

## High-Level Architecture

### Frontend Web App

Responsibilities:

- Authentication and player entry flow
- Lobby and room UI
- Match HUD and transaction panels
- 2.5D board rendering
- Animations and interaction feedback
- Connecting to REST API and Colyseus rooms

### Backend API

Responsibilities:

- Authentication
- Player profile management
- Room listing and match metadata
- Match history
- Leaderboards
- Persistence to PostgreSQL

### Game Server

Responsibilities:

- Create and manage lobby rooms
- Create and manage active Monopoly rooms
- Maintain authoritative match state
- Validate player actions
- Execute turn rules and state transitions
- Broadcast synchronized state to all connected players

### Database

Responsibilities:

- Persist user data
- Persist room and match metadata
- Persist match results and statistics
- Persist transaction history when needed

### Infra

Responsibilities:

- Redis for Colyseus presence when scaling
- Environment configuration
- Logging and monitoring

## System Flow

1. Player opens the React web app.
2. Frontend calls backend API for auth, profile, and room data.
3. Player joins a Colyseus lobby room.
4. When the game starts, the player joins a Monopoly game room.
5. Colyseus room becomes the single source of truth for gameplay state.
6. Client sends only gameplay commands such as roll dice, buy property, and end turn.
7. Server validates and resolves all actions.
8. Match result and summary data are stored in PostgreSQL.

## Core Architecture Rules

- The server is authoritative for all gameplay logic.
- The client never decides dice results, balance changes, ownership, or rule outcomes.
- Real-time state lives in Colyseus room memory and schema state.
- PostgreSQL stores durable data, not per-frame game synchronization.
- Redis is introduced when moving from single-instance to multi-instance deployment.

## Suggested Repository Structure

```text
apps/
  web/
  api/
  game-server/
packages/
  game-engine/
  shared-types/
  shared-config/
docs/
```

## Shared Modules Recommendation

### packages/game-engine

Contains pure TypeScript game rules:

- turn flow
- dice resolution
- tile resolution
- jail logic
- property purchase
- rent calculation
- bankruptcy flow

### packages/shared-types

Contains shared contracts:

- DTOs
- room message payloads
- enums
- IDs and common types

## Initial Database Scope

Recommended persistent tables:

- users
- profiles
- rooms
- matches
- match_players
- transactions
- leaderboards

## Initial Colyseus Room Scope

### LobbyRoom

- Create room
- Join room
- Leave room
- Ready / unready
- Start match

### MonopolyRoom

- Initialize match state
- Assign turn order
- Receive player commands
- Resolve rules
- Update synchronized state
- Handle disconnect and reconnect
- End match and persist result

## Phase-by-Phase Plan

## Phase 0 - Foundation Reference

Goal:

- Freeze the stack, architecture direction, and implementation order before building features.

Deliverables:

- This planning document
- Agreement on MVP scope
- Agreement on folder structure

## Phase 1 - Define MVP Rules

Goal:

- Lock down the first playable version of the game.

Tasks:

- Define the MVP gameplay loop
- Define supported player count: 4-6 players
- Define what is included in the first release:
  - lobby
  - ready flow
  - roll dice
  - move
  - buy property
  - pay rent
  - jail basic rules
  - end turn
  - win / lose
- Define what is explicitly excluded for now:
  - trade
  - mortgage
  - bot players
  - advanced effects
  - polished animations

Deliverables:

- MVP rules document
- Action list per turn
- Out-of-scope list

## Phase 2 - Design Domain Model and State Model

Goal:

- Design the game state before building UI or networking.

Tasks:

- Define player state
- Define room state
- Define board tile data
- Define property ownership model
- Define turn state
- Define card deck state
- Define command and event contract

Deliverables:

- State model draft
- Event/message contract
- Initial shared types list

## Phase 3 - Project Setup

Goal:

- Create the base code structure and tooling.

Tasks:

- Set up monorepo or multi-app workspace
- Create apps/web
- Create apps/api
- Create apps/game-server
- Create shared packages
- Configure TypeScript
- Configure linting and formatting
- Configure environment variables
- Add logging base

Deliverables:

- Running workspace skeleton
- Base scripts for dev/build/test

## Phase 4 - PostgreSQL and Persistence Layer

Goal:

- Define and implement persistent data storage.

Tasks:

- Design relational schema
- Set up PostgreSQL
- Set up Prisma
- Create migrations
- Add seed data for board configuration if needed
- Implement repositories/services for core entities

Deliverables:

- Initial database schema
- Prisma models
- Migration files

## Phase 5 - Backend API

Goal:

- Build the app-facing backend outside the active game room logic.

Tasks:

- Implement authentication
- Implement player profile endpoints
- Implement room listing endpoints
- Implement match history endpoints
- Implement leaderboard endpoints
- Add validation and error handling

Deliverables:

- Working API for non-real-time features
- API documentation

## Phase 6 - Pure Game Engine

Goal:

- Build gameplay logic as isolated TypeScript logic before wiring Colyseus.

Tasks:

- Implement dice flow
- Implement tile resolution
- Implement property buying
- Implement rent calculations
- Implement jail logic
- Implement bankruptcy logic
- Implement turn progression

Deliverables:

- Reusable game engine package
- Tested rule functions

## Phase 7 - Colyseus Integration

Goal:

- Turn the game engine into a real-time multiplayer room system.

Tasks:

- Implement LobbyRoom
- Implement MonopolyRoom
- Model synchronized state using @colyseus/schema
- Receive player commands
- Validate commands server-side
- Apply engine results to room state
- Broadcast state changes to players

Deliverables:

- Joinable lobby room
- Playable real-time room

## Phase 8 - Reconnect and Room Lifecycle

Goal:

- Make rooms resilient to disconnects and real user behavior.

Tasks:

- Handle reconnect flow
- Reserve player slots during temporary disconnects
- Handle AFK or timeout logic
- Handle player leave behavior
- Prepare Redis presence for scaling path

Deliverables:

- Stable reconnect behavior
- Room lifecycle rules

## Phase 9 - Functional Frontend

Goal:

- Build a complete playable web interface before heavy visual polish.

Tasks:

- Build landing page
- Build login / guest flow
- Build lobby UI
- Build room UI
- Build in-game UI shell
- Connect frontend to API
- Connect frontend to Colyseus
- Synchronize UI with room state

Deliverables:

- End-to-end playable functional interface

## Phase 10 - 2.5D Board and Visual Scene

Goal:

- Add the visual game board and player token experience.

Tasks:

- Build 2.5D board scene
- Add camera angle and lighting
- Add token models or placeholders
- Add tile highlighting
- Add move animation
- Add interaction feedback

Deliverables:

- Playable 2.5D board scene

## Phase 11 - HUD and UX Improvements

Goal:

- Improve usability and clarity during matches.

Tasks:

- Add roll dice controls
- Add buy property prompts
- Add player info panels
- Add owned property panel
- Add transaction log feed
- Add modal flows for card effects and important actions

Deliverables:

- Clear and usable gameplay HUD

## Phase 12 - Extended Gameplay Features

Goal:

- Complete the first full gameplay experience beyond the bare core.

Tasks:

- Add chance/community card effects
- Refine jail rules
- Add end game summary
- Optionally add:
  - mortgage
  - trade
  - houses / hotels
  - custom boards

Deliverables:

- More complete Monopoly feature set

## Phase 13 - Testing and Hardening

Goal:

- Stabilize quality, fairness, and production readiness.

Tasks:

- Add unit tests for rules
- Add integration tests for room logic
- Add end-to-end tests for user flow
- Test reconnect scenarios
- Test duplicate commands
- Test invalid or malicious actions
- Test race conditions and desync risks

Deliverables:

- Reliable test coverage for critical systems

## Phase 14 - Deployment and Scaling

Goal:

- Prepare the game for public or team use.

Tasks:

- Deploy frontend
- Deploy backend API
- Deploy Colyseus game server
- Provision PostgreSQL
- Add Redis for scaling
- Add logs, metrics, and room monitoring

Deliverables:

- Deployable production architecture

## Recommended Delivery Order

Build in this order:

1. Phase 1 - Define MVP Rules
2. Phase 2 - Design Domain Model and State Model
3. Phase 3 - Project Setup
4. Phase 4 - PostgreSQL and Persistence Layer
5. Phase 5 - Backend API
6. Phase 6 - Pure Game Engine
7. Phase 7 - Colyseus Integration
8. Phase 8 - Reconnect and Room Lifecycle
9. Phase 9 - Functional Frontend
10. Phase 10 - 2.5D Board and Visual Scene
11. Phase 11 - HUD and UX Improvements
12. Phase 12 - Extended Gameplay Features
13. Phase 13 - Testing and Hardening
14. Phase 14 - Deployment and Scaling

## Development Priorities

- Prioritize gameplay correctness before graphics polish.
- Keep rules isolated from rendering and transport layers.
- Keep the server authoritative from day one.
- Build a playable vertical slice before adding advanced content.
- Introduce Redis only when moving beyond a single game server instance.

## Notes for Future Reference

- If architecture changes later, update this file first.
- If a new feature does not align with MVP, place it in a later phase instead of forcing it early.
- If real-time and persistence concerns conflict, prefer Colyseus for active state and PostgreSQL for durable state.
