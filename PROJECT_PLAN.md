# Monopoly Web Game - Tech Stack and Implementation Plan

## Project Goal

Build a browser-based Monopoly-style game for 4-6 players with:

- Frontend in React
- Real-time multiplayer using Colyseus
- Backend in Node.js
- Persistent storage in PostgreSQL
- 2.5D visuals for the game board and player tokens

This document is the baseline reference for architecture, tech choices, implementation order, and current project status.

## Current Status

As of 2026-03-31, the project is currently at:

- Phase 1 to Phase 11: complete
- Phase 12: planned

The current implementation already includes:

- workspace scaffolding for `web`, `api`, `game-server`, and shared packages
- PostgreSQL + Prisma migrations and seed data
- read-side API endpoints for profiles, leaderboard, and match history
- pure game engine rules with automated tests
- Colyseus room integration backed by the pure engine
- reconnect, abandonment, leave, and idle-turn lifecycle handling
- first-wave live match persistence for `matches`, `match_players`, and `leaderboard_stats`
- automated integration coverage for room runtime and completed-match persistence
- a functional frontend shell in `apps/web`, including routed screens, Zustand session state, API-backed leaderboard and match history views, live lobby surfaces, an in-match HUD/event-feed shell, and live lobby/match room wiring through Colyseus
- route-level lazy loading and Vite manual chunk splitting so the frontend build no longer emits the previous large-chunk warning

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
- Fastify
- Prisma
- PostgreSQL
- Zod
- Optional later: Swagger / OpenAPI

### Real-time Game Server

- Colyseus
- @colyseus/schema
- Colyseus JavaScript client

### Scaling and Infrastructure

- Redis
- @colyseus/redis-presence

### Testing

- Node test runner for current engine tests
- Vitest for future broader test layers if needed
- Playwright for future end-to-end browser testing

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

- Strong fit for relational data such as users, matches, match players, and leaderboards
- Works very well with Prisma
- Can store snapshots or event metadata later using JSONB when needed

### Redis

- Used for Colyseus presence and scaling across multiple processes or servers
- Not required at the earliest local MVP stage, but should be part of the production path

## High-Level Architecture

### Frontend Web App

Responsibilities:

- Authentication and player entry flow
- Landing, lobby, and room UI
- Match HUD and transaction panels
- 2.5D board rendering
- Animations and interaction feedback
- Connecting to REST API and Colyseus rooms

### Backend API

Responsibilities:

- Player profile management
- Match history
- Leaderboards
- Read-side access to persisted data in PostgreSQL
- App-facing HTTP contracts and validation

### Game Server

Responsibilities:

- Create and manage lobby rooms
- Create and manage active Monopoly rooms
- Maintain authoritative live match state
- Validate player actions
- Execute turn rules and state transitions through the pure engine
- Handle disconnect, reconnect, abandonment, and idle lifecycle
- Persist completed match outcomes to PostgreSQL

### Database

Responsibilities:

- Persist user data
- Persist profile data
- Persist completed match results and player outcomes
- Persist leaderboard statistics
- Optionally persist richer transaction history later

### Infra

Responsibilities:

- Redis for Colyseus presence when scaling
- Environment configuration
- Logging and monitoring

## System Flow

1. Player opens the React web app.
2. Frontend calls backend API for profile, leaderboard, and match history data.
3. Player joins a Colyseus lobby room.
4. When the host starts the match, the player joins a Monopoly game room.
5. Colyseus room becomes the single source of truth for gameplay state.
6. Client sends only gameplay commands such as roll dice, buy property, and end turn.
7. Server validates and resolves all actions through the pure game engine.
8. When the match finishes, the game-server persists completed match results into PostgreSQL.
9. Backend API later serves persisted match and leaderboard data back to the client.

## Core Architecture Rules

- The server is authoritative for all gameplay logic.
- The client never decides dice results, balance changes, ownership, or rule outcomes.
- Real-time state lives in Colyseus room memory and schema state.
- PostgreSQL stores durable outcomes, not per-frame game synchronization.
- The pure game engine owns gameplay rules.
- Colyseus rooms own transport, timing, reconnect, and runtime orchestration.
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
- authoritative match end behavior

### packages/shared-types

Contains shared contracts:

- DTOs
- room message payloads
- events
- enums
- IDs and common types

### packages/shared-config

Contains shared static configuration:

- board config
- MVP constants
- room-related timing constants

## Persistent Database Scope

Current persistent tables:

- users
- profiles
- matches
- match_players
- transactions
- leaderboard_stats

Current first-wave write scope from the game-server:

- matches
- match_players
- leaderboard_stats

Planned next write scope:

- optionally richer transaction/event persistence later

## Colyseus Room Scope

### LobbyRoom

- Create room
- Join room
- Leave room
- Ready / unready
- Host start match

### MonopolyRoom

- Initialize match state
- Assign turn order
- Receive player commands
- Resolve rules through the pure engine
- Update synchronized state
- Handle reconnect, abandonment, and idle timeout
- End match and persist result

## Phase-by-Phase Plan

## Phase 0 - Foundation Reference

Status:

- Complete

Goal:

- Freeze the stack, architecture direction, and implementation order before building features.

Deliverables:

- This planning document
- Agreement on MVP scope
- Agreement on folder structure

## Phase 1 - Define MVP Rules

Status:

- Complete

Goal:

- Lock down the first playable version of the game.

Deliverables:

- MVP rules document
- Action list per turn
- Out-of-scope list

Reference:

- `docs/pharse1`

## Phase 2 - Design Domain Model and State Model

Status:

- Complete

Goal:

- Design the game state before building UI or networking.

Deliverables:

- State model draft
- Event/message contract
- Initial shared types list

Reference:

- `docs/pharse2`

## Phase 3 - Project Setup and Runnable Foundation

Status:

- Complete

Goal:

- Create the base code structure and tooling, and make the workspace installable and buildable.

Deliverables:

- Running workspace skeleton
- Base scripts for dev/build/typecheck
- Runnable `web`, `api`, and `game-server` foundations

Reference:

- `docs/pharse3`

## Phase 4 - PostgreSQL and Persistence Layer

Status:

- Complete

Goal:

- Define and implement persistent data storage.

Deliverables:

- Initial database schema
- Prisma models
- Migration files
- Seed data
- Repository/service boundaries for API-side persistence access

Reference:

- `docs/pharse4`

## Phase 5 - Backend API Read Layer

Status:

- Complete

Goal:

- Build the app-facing backend outside the active game room logic.

Deliverables:

- Working API for profiles, leaderboard, and match history
- Shared validation and error model

Reference:

- `docs/pharse5`

## Phase 6 - Pure Game Engine

Status:

- Complete

Goal:

- Build gameplay logic as isolated TypeScript logic before wiring Colyseus.

Deliverables:

- Reusable game engine package
- Tested rule functions

Reference:

- `docs/pharse6`

## Phase 7 - Colyseus Integration

Status:

- Complete

Goal:

- Turn the game engine into a real-time multiplayer room system.

Deliverables:

- Engine-backed room initialization
- Gameplay command execution pipeline
- Explicit gameplay event broadcasting

Reference:

- `docs/pharse7`

## Phase 8 - Reconnect and Room Lifecycle

Status:

- Complete

Goal:

- Make rooms resilient to disconnects and real user behavior.

Deliverables:

- Stable reconnect behavior
- Authoritative abandonment handling
- Idle timeout baseline for MVP

Reference:

- `docs/pharse8`

## Phase 9 - Live Match Persistence and Result Recording

Status:

- Complete

Goal:

- Persist completed live matches from the game-server into PostgreSQL.

Completed scope:

- persistence ownership and write boundary
- completed-match snapshot and mapping design
- game-server write-side Prisma adapter setup
- completed-match persistence for `matches` and `match_players`
- leaderboard updates for `leaderboard_stats`
- Phase 9 verification notes and sign-off

Reference:

- `docs/pharse9`

## Phase 10 - Multiplayer Integration Tests and Persistence Verification

Status:

- Complete

Goal:

- Add stronger automated verification around room lifecycle, authoritative gameplay, and persistence behavior.

Completed scope:

- room test harness baseline inside `apps/game-server`
- gameplay and lifecycle integration tests for authoritative room behavior
- PostgreSQL-backed persistence integration tests for completed matches and leaderboard updates
- failure-path verification for persistence status markers, retry behavior, and duplicate finalize safety
- consolidated verification summary and coverage review
- Phase 10 sign-off

Reference:

- `docs/pharse10`
## Phase 11 - Functional Frontend and App Flow

Status:

- Complete

Goal:

- Build the functional web interface for the game before heavy visual polish.

Completed scope:

- landing, menu, leaderboard, match-history, and match-detail routes in `apps/web`
- lobby list and lobby-room shells with ready-state and reconnect messaging patterns
- shared frontend providers, query layer, and Zustand stores for session and UI state
- in-match HUD shell with roster, action rail, economy cards, board window preview, connection banner, and filtered event feed
- live Colyseus wiring for lobby creation, lobby-room join flow, real match-room handoff, and live match projection with preview fallback
- route-level lazy loading and Vite manual chunking to resolve the previous large frontend build chunk warning
- Phase 11 sign-off

Deliverables:

- end-to-end playable functional interface ready for Phase 12 board integration

Reference:

- `docs/pharse11`

## Phase 12 - 2.5D Board and Gameplay Scene
Status:

- Planned

Goal:

- Add the visual game board and token experience.

Planned tasks:

- build 2.5D board scene
- add camera angle and lighting
- add token models or placeholders
- add tile highlighting
- add move animation
- add interaction feedback

Deliverables:

- playable 2.5D board scene

## Phase 13 - Post-Match UX and Frontend Polish

Status:

- Planned

Goal:

- Improve usability, clarity, and post-match flow on the client.

Planned tasks:

- add result screen
- add reconnect UX and finished-match handling
- refine HUD flows and state feedback
- add loading, error, and transition polish
- refine event-driven UX for payments, elimination, and turn changes

Deliverables:

- polished match and post-match user experience

## Phase 14 - Production Hardening, Deployment, and Scaling

Status:

- Planned

Goal:

- Prepare the game for production-like deployment and scaling.

Planned tasks:

- deploy frontend
- deploy backend API
- deploy Colyseus game server
- provision PostgreSQL
- add Redis for scaling
- add logs, metrics, and room monitoring
- harden multi-instance and operational flows

Deliverables:

- deployable production architecture

## Recommended Delivery Order

Build in this order:

1. Phase 0 - Foundation Reference
2. Phase 1 - Define MVP Rules
3. Phase 2 - Design Domain Model and State Model
4. Phase 3 - Project Setup and Runnable Foundation
5. Phase 4 - PostgreSQL and Persistence Layer
6. Phase 5 - Backend API Read Layer
7. Phase 6 - Pure Game Engine
8. Phase 7 - Colyseus Integration
9. Phase 8 - Reconnect and Room Lifecycle
10. Phase 9 - Live Match Persistence and Result Recording
11. Phase 10 - Multiplayer Integration Tests and Persistence Verification
12. Phase 11 - Functional Frontend and App Flow
13. Phase 12 - 2.5D Board and Gameplay Scene
14. Phase 13 - Post-Match UX and Frontend Polish
15. Phase 14 - Production Hardening, Deployment, and Scaling

## Development Priorities

- Prioritize gameplay correctness before graphics polish.
- Keep rules isolated from rendering and transport layers.
- Keep the server authoritative from day one.
- Build persistence for completed outcomes before leaning heavily on UI polish.
- Build a playable vertical slice before adding advanced content.
- Introduce Redis only when moving beyond a single game server instance.

## Notes for Future Reference

- If architecture changes later, update this file first.
- If a new feature does not align with the current milestone, place it in a later phase instead of forcing it early.
- If real-time and persistence concerns conflict, prefer Colyseus for active state and PostgreSQL for durable state.
- Keep this file aligned with the detailed `docs/pharse*` folders as implementation advances.








