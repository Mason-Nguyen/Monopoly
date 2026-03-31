# Phase 11 - Step 2: Route Map and App Flow Design

## Planning Basis

This step continues the Game Studio-guided frontend plan, mainly using:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

That means the route design should support a browser-game flow, not a generic product dashboard.

The route tree must:

- get the player into a playable state quickly
- keep the match route focused on the play session
- keep menu and history surfaces outside the match playfield
- support reconnect and invalid-state recovery cleanly

## Objective

Define the Phase 11 route tree, main screen transitions, and fallback states for loading, empty, invalid, and reconnect paths.

## Step 2 Assumptions

The route plan assumes the current MVP state of the project:

- full auth is not implemented yet
- the client may still need a lightweight guest or local player identity bootstrap
- match history is already available from the HTTP API
- live room state comes from Colyseus
- result handling can begin as a lightweight route/screen even if the final post-match polish comes later

## Recommended Route Tree

The functional client should use the following route tree.

### Public and Entry Routes

- `/`
  - landing page
  - primary CTA to enter the game flow
- `/play`
  - main home/menu hub after entry
  - access point for lobbies, leaderboard, and match history

### Product Data Routes

- `/leaderboard`
  - leaderboard list view
- `/matches`
  - match history list view
- `/matches/:matchId`
  - persisted match detail view
  - used for completed-match inspection outside the live room

### Lobby Routes

- `/lobbies`
  - lobby list and create/join entry surface
- `/lobbies/:lobbyId`
  - lobby detail / pre-match room
  - ready state, player list, host start, room status messaging

### Match Routes

- `/match/:matchId`
  - active live match shell
  - HUD, playfield reserve, event feed, reconnect banners
- `/match/:matchId/result`
  - lightweight result route for functional Phase 11 flow
  - may redirect to persisted match detail later if the live room is no longer authoritative for the session

## Route Responsibility Map

### `/`

Purpose:

- introduce the game
- explain what the player can do next
- move the player into the playable app shell quickly

Primary actions:

- `Play Now`
- `View Leaderboard`
- `View Match History`

### `/play`

Purpose:

- central menu hub
- player enters the real app flow from here

Primary actions:

- `Browse Lobbies`
- `Create or Join Lobby`
- `Leaderboard`
- `Recent Matches`
- `Resume Match` if reconnectable session data exists later

### `/leaderboard`

Purpose:

- durable stats browsing
- non-realtime informational surface

Data source:

- HTTP only

### `/matches`

Purpose:

- durable match history browsing

Data source:

- HTTP only

### `/matches/:matchId`

Purpose:

- persisted match detail after the game is over
- fallback screen when a live room is no longer available but historical data exists

Data source:

- HTTP only

### `/lobbies`

Purpose:

- list or discover available lobbies
- act as the entry point to pre-match multiplayer flow

Data source:

- HTTP first
- may later include live room discovery integrations

### `/lobbies/:lobbyId`

Purpose:

- pre-match multiplayer room
- ready/unready
- host start
- reconnect back into the same lobby room if needed

Data source:

- Colyseus `LobbyRoom`
- lightweight supporting HTTP data only if needed

### `/match/:matchId`

Purpose:

- live active match
- one focused play-session screen with HUD, playfield reserve, and transient overlays

Data source:

- Colyseus `MonopolyRoom`
- optional supporting HTTP fetches only for side panels or later enrichments

### `/match/:matchId/result`

Purpose:

- functional result handoff from the live session
- can be entered from a completed live room or from a reconnect attempt that lands after match completion

Data source:

- room result if still available
- persisted match detail as fallback

## Primary Screen-to-Screen Flow

The intended happy-path app flow is:

1. `/`
2. `/play`
3. `/lobbies`
4. `/lobbies/:lobbyId`
5. `/match/:matchId`
6. `/match/:matchId/result`
7. `/matches/:matchId` when the player wants the durable match detail view later

## Supported Secondary Flows

### History-Led Flow

1. `/`
2. `/matches`
3. `/matches/:matchId`

### Competitive Browse Flow

1. `/`
2. `/leaderboard`
3. `/play`
4. `/lobbies`

### Reconnect Flow

1. player reopens app or refreshes
2. client resolves last known live session metadata
3. client attempts to enter `/match/:matchId`
4. reconnect succeeds into live match, or falls back to result/history routes if the match is already finished

## Loading and Fallback States

Each route class should have explicit fallback behavior.

### Landing and Menu Routes

Loading state:

- minimal shell with immediate CTA visibility
- no blocking spinner over the entire page unless absolutely necessary

Error state:

- non-fatal toast or inline panel for optional data failures
- keep navigation usable

### HTTP Data Routes

Routes:

- `/leaderboard`
- `/matches`
- `/matches/:matchId`

Loading state:

- list or detail skeletons

Empty state:

- friendly no-data state with return navigation

Error state:

- retry action
- back navigation to `/play`

### Lobby Routes

Routes:

- `/lobbies`
- `/lobbies/:lobbyId`

Loading state:

- room connection pending screen with clear status messaging

Empty state:

- no lobbies available -> encourage create/join action

Invalid state:

- lobby not found / expired -> show inline room-unavailable screen and route back to `/lobbies`

Reconnect state:

- if the player already belongs to the lobby, attempt reconnect before rendering full error

### Match Route

Route:

- `/match/:matchId`

Loading state:

- dedicated match-connecting shell, not a generic blank spinner
- preserve the feel that the player is entering a live session

Invalid state:

- match id unknown
- player not part of the room
- reconnect window expired

Fallback behavior:

- if historical match data exists, offer jump to `/matches/:matchId`
- otherwise route back to `/play` or `/lobbies`

Reconnect state:

- attempt live room reclaim first
- if match already finished, route to `/match/:matchId/result` or persisted match detail

Finished state:

- when the room reports `finished`, transition to result flow rather than leaving the player in a dead live-room shell

## Redirect and Guard Rules

### Entry Guard

If the player identity bootstrap is missing:

- `/play`, `/lobbies`, `/lobbies/:lobbyId`, and `/match/:matchId` should redirect through a lightweight entry/bootstrap step inside the app shell

### Match Guard

If the player is not allowed to control the room seat:

- do not leave the user on a broken match shell
- show one explicit error state and provide a next action:
  - `Back to Lobbies`
  - `Open Match History`

### Finished Match Redirect

If the live match is already completed and room control is no longer relevant:

- route toward `/match/:matchId/result`
- from there allow transition to `/matches/:matchId`

## Route-Level Layout Model

The client should use three layout classes.

### Marketing Layout

Routes:

- `/`

Purpose:

- expressive landing experience
- no app-dashboard chrome

### App Shell Layout

Routes:

- `/play`
- `/leaderboard`
- `/matches`
- `/matches/:matchId`
- `/lobbies`
- `/lobbies/:lobbyId`

Purpose:

- shared navigation and structured DOM content

### Match Shell Layout

Routes:

- `/match/:matchId`
- `/match/:matchId/result`

Purpose:

- low-chrome play-focused layout
- reserved center playfield region
- compact HUD clusters and transient overlays

## Phase 11 Route Decisions Locked

This step locks the following decisions:

- the functional client uses separate route classes for landing, app shell, and match shell
- live match and persisted match detail are different screens with different responsibilities
- result handling begins in Phase 11 with a lightweight result route
- reconnect entry is treated as a first-class app flow, not an afterthought
- invalid room and expired session states must route users toward a valid next action instead of leaving them stranded

## Expected Next Step

The next step is:

- `Phase 11 - Step 3: Frontend Data and Realtime Integration Architecture`