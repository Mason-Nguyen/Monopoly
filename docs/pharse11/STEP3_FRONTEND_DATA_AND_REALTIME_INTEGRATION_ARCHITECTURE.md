# Phase 11 - Step 3: Frontend Data and Realtime Integration Architecture

## Planning Basis

This step continues the Game Studio-guided frontend plan, mainly using:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

That means the frontend integration architecture must keep simulation authority outside the renderer and outside the browser UI layer.

For this project, the browser client is not a secondary game engine. It is a presentation and interaction layer on top of:

- HTTP-backed durable product data
- Colyseus-backed authoritative room state

## Objective

Define how the `web` app should divide responsibilities across React Query, Colyseus clients, Zustand, route-level loaders, and UI-only view models.

## Current Implementation Context

The current `web` package is still a lightweight runtime shell.

Already present:

- React
- Vite
- shared config and shared types packages

Planned next frontend runtime additions for implementation:

- `react-router`
- `@tanstack/react-query`
- `zustand`
- Colyseus JavaScript client
- `zod` for local parsing and guardrails when needed

## Architectural Principle for Step 3

The frontend should follow this hierarchy of truth.

### Durable Product Truth

Owner:

- HTTP API

Examples:

- profile
- leaderboard
- match history
- persisted match detail

Frontend owner:

- React Query

### Live Match Truth

Owner:

- Colyseus room state

Examples:

- lobby player list
- ready state
- match player balances
- positions
- active turn
- ownership
- live result

Frontend owner:

- room connection layer plus read-only projections into React components

### Presentation Truth

Owner:

- client-local UI state

Examples:

- active drawer
- selected HUD tab
- local banner dismissal
- temporary command pending indicator
- chosen sort/filter state for lists

Frontend owner:

- Zustand or local component state

## Core Rule: Do Not Mirror the Whole Room Into Zustand

This step locks one important rule for implementation.

The frontend should not copy the full `LobbyRoomState` or `MonopolyRoomState` into Zustand as a second source of truth.

Instead:

- the room client keeps the live authoritative state reference
- React components subscribe to stable projections/selectors
- Zustand only stores UI concerns or tiny derived interaction state

Reason:

- mirroring the full room state creates sync bugs, stale state risks, and duplicated ownership
- Phase 10 already verified the room runtime; the client should consume it, not re-author it

## Frontend Module Boundaries

The `web` app should be organized into these frontend integration layers.

### 1. Routing Layer

Responsibility:

- maps URL to screen
- provides route loaders, guards, and fallback states
- decides whether a route needs HTTP data, room connection, or both

Suggested location:

- `apps/web/src/app`
- `apps/web/src/pages`

### 2. HTTP Data Layer

Responsibility:

- all REST requests to `apps/api`
- response parsing and typed result mapping
- query keys and React Query hooks

Suggested location:

- `apps/web/src/services/api`
- `apps/web/src/features/*/queries`

### 3. Room Connection Layer

Responsibility:

- join/reconnect/leave room connections
- bind Colyseus events and room state listeners
- expose lifecycle-safe helpers for lobby and match routes

Suggested location:

- `apps/web/src/services/rooms`

### 4. UI Store Layer

Responsibility:

- ephemeral browser UI state only
- no duplicated authoritative room state

Suggested location:

- `apps/web/src/stores`

### 5. Projection/View-Model Layer

Responsibility:

- convert raw API data and raw room state into UI-friendly shapes
- compute lightweight derived values for components

Suggested location:

- `apps/web/src/features/*/selectors`
- `apps/web/src/features/*/view-models`

## React Query Responsibilities

React Query should own all durable fetches.

### Query Domains

Recommended query domains:

- profile
- leaderboard
- match history
- persisted match detail

### Suggested Query Keys

Recommended key structure:

- `['profile', userId]`
- `['leaderboard', { limit, offset }]`
- `['matches', { limit, offset }]`
- `['match-detail', matchId]`

### React Query Rules

- route-level product data should use React Query, not manual `useEffect` fetch chains
- screens should tolerate loading, empty, and error states without blocking unrelated navigation
- cached durable data may continue to render while room transitions occur elsewhere in the app

## Colyseus Client Responsibilities

The Colyseus client layer should be split by room kind.

### Lobby Room Client

Responsibility:

- connect to `LobbyRoom`
- expose join lifecycle
- observe ready state, player list, and start-transfer events
- send `lobby:setReady`
- send `lobby:startMatch`

Relevant shared contracts:

- `LobbyRoomState`
- `lobby:setReady`
- `lobby:startMatch`
- `lobby:matchStarting`
- `lobby:error`

### Match Room Client

Responsibility:

- connect to `MonopolyRoom`
- expose live state projections for HUD and playfield shell
- send `game:rollDice`, `game:buyProperty`, `game:endTurn`
- listen to `game:*` events for feed, toast, and transition UX

Relevant shared contracts:

- `MonopolyRoomState`
- `game:rollDice`
- `game:buyProperty`
- `game:endTurn`
- `game:diceRolled`
- `game:playerMoved`
- `game:tileResolved`
- `game:paymentApplied`
- `game:propertyPurchased`
- `game:playerEliminated`
- `game:playerConnectionChanged`
- `game:resultReady`

## Recommended Frontend Service Map

The client should introduce the following services.

### `sessionService`

Responsibility:

- bootstrap guest or local player identity for MVP
- persist local player identity and last-known live session metadata

### `apiClient`

Responsibility:

- base fetch wrapper for REST API
- request/response typing
- error normalization for React Query hooks

### `profileQueries`

Responsibility:

- profile query hooks

### `leaderboardQueries`

Responsibility:

- leaderboard query hooks

### `matchQueries`

Responsibility:

- match history and match detail query hooks

### `lobbyRoomClient`

Responsibility:

- create/join/reconnect the lobby room connection
- expose event handlers and state accessors for the lobby route

### `matchRoomClient`

Responsibility:

- create/join/reconnect the match room connection
- expose live state access, command helpers, and event subscriptions

### `reconnectService`

Responsibility:

- resolve last-known room context
- decide whether the app should attempt lobby reconnect, match reconnect, result fallback, or history fallback

### `eventFeedAdapter`

Responsibility:

- convert `game:*` events into UI feed entries, banners, and toasts
- keep event presentation separate from raw room transport concerns

## Recommended Zustand Store Map

Zustand should stay intentionally small.

### `sessionStore`

Safe scope:

- local player id
- display name draft or guest profile draft
- last-known reconnect metadata

### `uiStore`

Safe scope:

- drawer open/close state
- selected panel tab
- compact/expanded HUD preferences
- transient route-level banners

### `matchUiStore`

Safe scope:

- pending command indicator for buttons
- feed filter mode
- selected property card in the HUD
- whether optional side panels are collapsed

Unsafe scope for Zustand:

- canonical balances
- canonical positions
- canonical room player list
- canonical turn state
- canonical ownership state

Those must stay in Colyseus state projections.

## Realtime Projection Strategy

The client should use a projection layer between raw Colyseus state and UI components.

### Lobby Projections

Examples:

- `selectLobbyPlayerList(roomState)`
- `selectLobbyCanCurrentPlayerStart(roomState, localPlayerId)`
- `selectLobbyStatusBanner(roomState)`

### Match Projections

Examples:

- `selectActivePlayer(roomState)`
- `selectCurrentTurnSummary(roomState)`
- `selectCurrentPlayerActions(roomState, localPlayerId)`
- `selectEconomySidebar(roomState)`
- `selectPlayerRoster(roomState)`
- `selectPropertyOwnershipSummary(roomState)`

These projections should be deterministic and side-effect free.

## Event-Driven UI Responsibilities

Not everything should come from raw state reads alone.

The following UI surfaces should prefer `game:*` events as triggers:

- toast notifications
- transaction feed items
- elimination banners
- reconnect countdown banners
- movement and dice animation triggers later in Phase 12

The following UI surfaces should prefer synchronized room state:

- active player chip
- balance display
- ownership display
- room player roster
- turn phase controls
- result screen fallback data

## Reconnect and Recovery Integration

The frontend should treat reconnect as an application concern, not just a room concern.

Recommended flow:

1. session bootstrap resolves local player identity
2. reconnect service checks for last-known lobby or match context
3. route loader decides whether to:
   - attempt live lobby reconnect
   - attempt live match reconnect
   - route to result flow
   - route back to menu/lobbies
4. room client surfaces one explicit pending state, not multiple competing reconnect indicators

## Command Submission Rules

The client command layer should follow these rules.

### Rule 1 - Commands Stay Thin

The client only sends approved payloads from shared contracts.

Examples:

- `game:rollDice -> {}`
- `game:buyProperty -> { propertyId }`
- `game:endTurn -> {}`

### Rule 2 - Pending UI Is Local, Not Authoritative

Buttons may enter pending/disabled states locally, but the authoritative effect still comes from room state and server events.

### Rule 3 - Errors Surface Through Shared Event/Error Paths

UI should not invent custom gameplay error logic when `game:error` or `lobby:error` already exists.

## Phase 11 Step 3 Decisions Locked

This step locks the following decisions:

- React Query owns durable HTTP data
- Colyseus clients own live room state access
- Zustand stays limited to UI-only and session-only concerns
- the frontend must not mirror full room state into a client store
- projections/selectors sit between raw transport state and UI components
- `game:*` events are the trigger layer for feed/toast/banner UX, not the replacement for room state

## Expected Next Step

The next step is:

- `Phase 11 - Step 4: Landing and Home/Menu UX Plan`