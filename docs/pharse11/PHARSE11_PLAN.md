# Phase 11 - Functional Frontend and App Flow

## Planning Basis

This phase plan is guided by the Game Studio plugin, mainly:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

The resulting direction follows three principles:

- keep the browser-game UI DOM-first for text-heavy surfaces
- protect the future 2.5D playfield instead of filling the screen with dashboard UI
- keep frontend app flow clearly separated from Colyseus room authority and gameplay simulation

## Purpose

Phase 11 turns the current frontend scaffold into a real functional client application.

This phase is intentionally about product flow and usable interface layers, not final board rendering. The goal is to make the game playable through browser UI and authoritative room state before Phase 12 introduces the dedicated 2.5D board scene.

## Phase 11 Goal

Build the functional web interface for the game so a player can move through landing, entry, lobby, room, and match HUD flows while the client stays aligned with the already-verified API and Colyseus runtime.

## Inputs from Previous Phases

Phase 11 builds directly on:

- Phase 5 read-side API contracts for profiles, leaderboard, and match history
- Phase 7 authoritative `game:*` event broadcasting from `MonopolyRoom`
- Phase 8 reconnect and lifecycle behavior
- Phase 9 durable completed-match persistence
- Phase 10 automated verification for multiplayer runtime and persistence

## Required End State for Phase 11

By the end of Phase 11:

- the `web` app has a real route and screen structure
- players can move through landing, menu, lobby, room, and match UI shells
- frontend data and realtime boundaries are explicit and stable
- the in-match screen works with a functional HUD even before the 2.5D board scene is introduced
- the client is wired to the API and live Colyseus room flow without a large frontend rewrite later
- the client is ready to host the dedicated board renderer in Phase 12 without replacing the Phase 11 shell

## Current Implementation Status

As of 2026-03-31, Phase 11 implementation is complete. Real code in `apps/web` now includes:

- router, layout, and provider foundations for the frontend app shell
- local guest-session, match UI, and general UI stores with Zustand
- API client and React Query hooks for leaderboard, match history, lobby previews, and match-shell preview data
- implemented screens for landing, home/menu, leaderboard, match history, match detail, result handoff, lobby list, lobby room, and the live match shell baseline
- a richer in-match HUD shell with roster, action rail, economy cards, board window preview, connection banner, and filtered event feed
- live lobby creation, live lobby-route wiring, server-backed match-room handoff, and a live match provider with preview fallback
- route-level lazy loading and Vite manual chunking so the web build no longer emits the previous oversized chunk warning
- a production-buildable frontend pass verified with `npm run typecheck --workspace @monopoly/web` and `npm run build --workspace @monopoly/web`

## Phase 11 Deliverables

By the end of Phase 11, the project should have:

- frontend scope and UI surface boundary documentation plus implemented shell constraints
- route map and screen-flow documentation plus implemented route structure
- shared frontend state and service integration baseline in code
- landing and home/menu implementation
- lobby and room UI implementation
- in-match HUD and event-feed implementation
- live API and Colyseus room integration for functional play flow
- route-level lazy loading and chunk-splitting to keep the frontend build healthy before Phase 12
- Phase 11 sign-off

## Recommended Step Order

### Step 1 - Frontend Scope and UI Surface Boundaries

Focus:

- define what belongs to DOM UI in Phase 11
- define what is intentionally deferred to the 2.5D renderer in Phase 12
- lock frontend state ownership and integration boundaries

Output:

- frontend scope document
- approved UI-surface and state-boundary rules

### Step 2 - Route Map and App Flow Design

Focus:

- define the route tree for landing, entry, lobby, room, match, and results
- map screen-to-screen transitions and fallback states
- define loading, empty, error, and reconnect entry paths

Output:

- route map document
- approved app-flow diagram for the functional client

### Step 3 - Frontend Data and Realtime Integration Architecture

Focus:

- define React Query, Zustand, and Colyseus responsibilities
- decide how profile data, lobby state, match state, and event-driven UI updates connect
- define client service boundaries for API and room connections

Output:

- frontend integration architecture document
- approved state ownership map for the client

### Step 4 - Landing and Home/Menu Implementation

Focus:

- implement the landing page, main entry actions, and home/menu screen
- define how the product introduces the game, match history, and leaderboard access
- align visual direction with the browser-game tone rather than generic app dashboards

Output:

- landing and home/menu implementation

### Step 5 - Lobby and Room UI Implementation

Focus:

- implement lobby list, room detail, ready-state, host-start, and reconnect messaging
- define how multiplayer lifecycle status is surfaced without overloading the screen

Output:

- lobby and room UI implementation

### Step 6 - In-Match HUD and Event-Feed Implementation

Focus:

- implement the functional in-match screen before the Phase 12 board renderer exists
- define the HUD clusters, action controls, economy panels, and event feed
- protect the future playfield area from permanent UI clutter

Output:

- HUD and match-screen implementation

### Step 7 - Live Lobby and Match Wiring Implementation

Focus:

- connect the frontend room routes to live Colyseus lobby and match rooms
- replace preview-driven state where possible with room projections and realtime events
- establish reconnect-friendly room session handling on the client

Output:

- live room wiring implementation

### Step 8 - Phase 11 Sign-Off

Focus:

- confirm that the frontend implementation is aligned with the existing runtime and persistence architecture
- confirm that the client is ready to host the dedicated board renderer in Phase 12
- confirm that the web build no longer emits the previous large chunk warning

Output:

- Phase 11 sign-off document

## Working Principles for Phase 11

- DOM owns text-heavy menus, HUD, lists, and overlays by default
- Colyseus state remains authoritative for live match state; the frontend only projects and presents it
- React Query should own durable HTTP data such as profile, leaderboard, and match history
- Zustand or local UI state should own transient client-side interaction state
- the center and lower-middle playfield should stay as clear as possible in the match screen
- Phase 11 should create a functional shell that Phase 12 can enrich visually, not replace structurally

## Planned In-Scope Areas

The first implementation wave of Phase 11 should focus on:

- landing page and main menu
- profile-aware entry flow
- lobby list and lobby room surfaces
- room ready-state and host-start interactions
- in-match HUD shell
- event feed and action prompts
- frontend service wiring to the API and Colyseus

## Explicitly Deferred or Limited Areas

The following areas are not the main target of Phase 11:

- dedicated 2.5D board rendering
- camera, token movement, lighting, and scene composition
- asset polish and final art direction for the board scene
- browser playtests focused on the rendered 2.5D experience
- production-scale frontend optimization and polish

## Expected Handoff After Phase 11

Once Phase 11 is complete, the project should be ready to continue with:

- Phase 12 board scene implementation in React Three Fiber
- match-screen integration of HUD plus 2.5D playfield
- richer post-match UX and polished frontend transitions in later phases