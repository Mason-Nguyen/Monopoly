# Phase 11 - Step 1: Frontend Scope and UI Surface Boundaries

## Planning Basis

This step is planned with guidance from the Game Studio plugin, especially:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

That means the frontend direction should prioritize:

- DOM-first UI for readable and accessible browser-game surfaces
- small, intentional persistent HUD clusters instead of dashboard-like chrome
- clear ownership boundaries between client presentation, API data, Colyseus room state, and the future 2.5D renderer

## Objective

Define what the frontend is responsible for in Phase 11, what should stay out of scope until Phase 12, and how the client should divide responsibilities across routes, UI layers, durable data, realtime data, and future scene rendering.

## Phase 11 Frontend Scope

Phase 11 should implement the functional browser-game client shell.

That includes:

- landing page
- home and menu surfaces
- lobby list screen
- lobby room screen
- in-match screen shell
- functional HUD and event-feed surfaces
- API integration for durable product data
- Colyseus integration for live room and match state

Phase 11 should not try to solve final board presentation.

That means the following are intentionally deferred:

- final 2.5D board scene
- polished token rendering and movement animation
- final camera composition
- board-focused FX or scene lighting polish

## UI Surface Model

The frontend should be divided into three surface layers.

### 1. App Flow Surface

Purpose:

- all non-match routes and high-level navigation

Examples:

- landing page
- home/menu
- profile entry points
- leaderboard page
- match history page
- lobby list page

Technology direction:

- React routes
- DOM-first layout
- React Query for HTTP-backed data

### 2. Match Shell Surface

Purpose:

- the functional match page that contains the play area, HUD, action controls, banners, prompts, and transient overlays

Examples:

- turn banner
- money and property summary clusters
- action controls such as `rollDice`, `buyProperty`, `endTurn`
- reconnect notices
- elimination and result overlays
- event feed / transaction feed

Technology direction:

- DOM-first UI
- Zustand for client interaction state
- Colyseus client state projection for live match data

### 3. Playfield Surface

Purpose:

- the visual board area reserved for the Phase 12 2.5D renderer

Phase 11 rule:

- do not let DOM HUD structure consume this space as if it were already a dashboard layout
- the layout should already reserve a central playable area that Phase 12 can fill later

## State Ownership Boundaries

### Durable App Data

Owner:

- React Query

Examples:

- profile data
- leaderboard data
- match history data

Reason:

- this data is request/response based and should follow normal HTTP caching and loading semantics

### Live Match Data

Owner:

- Colyseus room state

Examples:

- active player
- balances
- positions
- room status
- ownership
- match result

Reason:

- the server is already authoritative and the frontend should only reflect synchronized room state

### Client-Local UI State

Owner:

- Zustand or local component state

Examples:

- currently open drawer or modal
- selected tab in HUD
- transient notification visibility
- reconnect banner dismissed state
- compact or expanded panel preferences

Reason:

- these are presentation concerns, not authoritative game data

### Future 2.5D Render State

Owner:

- Phase 12 renderer integration layer

Examples:

- token movement animation timing
- camera transitions
- tile highlight animation
- scene-level effects

Reason:

- these states are visual projections of authoritative room state, not the source of truth themselves

## Frontend Boundary Rules

The frontend should follow these rules in Phase 11.

### Rule 1 - No Gameplay Authority in the Client

The client must never decide:

- dice values
- economy resolution
- property ownership outcomes
- turn legality
- elimination outcomes

It may only:

- present state
- send approved commands
- react to state changes and explicit `game:*` events

### Rule 2 - DOM Owns Text-Heavy UI

By default, the following should stay in DOM UI, not inside the future board renderer:

- buttons
- menus
- forms
- toasts
- feed items
- drawers
- detail panels
- result overlays

### Rule 3 - Protect the Future Playfield

The in-match layout should already be designed so that:

- the center viewport remains mostly clear
- the lower-middle viewport remains mostly clear
- persistent HUD density stays low enough that the future board scene still has room to breathe

### Rule 4 - Route Flow Before Visual Polish

Phase 11 should prioritize:

- usable route flow
- stable loading/error states
- correct data integration
- clear multiplayer state feedback

It should not over-invest early in visual flourish that may need rework when the 2.5D scene arrives.

## Recommended Phase 11 Screen Stack

The functional client should be planned around this screen stack:

- `/` for landing and primary calls to action
- `/play` or equivalent for the main home/menu shell
- `/leaderboard`
- `/matches`
- `/lobbies`
- `/lobbies/:lobbyId`
- `/match/:matchId`

Exact route names can still be refined in Step 2, but the frontend scope should already assume these screen classes exist.

## Functional Match Layout Budget

The Phase 11 match screen should follow this budget:

- one compact top-edge status strip or turn chip cluster
- one side cluster for player/economy summary
- one action cluster near an edge, not center-screen
- one event feed or compact log that can collapse
- one reserved central playfield region for the future board renderer

Anti-patterns to avoid:

- dashboard cards spread across the whole viewport
- large persistent center overlays during normal play
- fully expanded notes, controls, logs, and player data all at once

## Step 1 Decisions Locked

This step locks the following decisions for Phase 11:

- Phase 11 is a functional frontend phase, not a board-rendering phase
- DOM-first UI is the default for all text-heavy surfaces
- React Query owns durable API data
- Colyseus owns live room data
- client UI state stays separate from authoritative match state
- the match page must preserve a reserved playfield region for Phase 12

## Expected Next Step

The next step is:

- `Phase 11 - Step 2: Route Map and App Flow Design`