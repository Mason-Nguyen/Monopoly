# Phase 2 - Step 2: Colyseus Room State Design

## Objective

Map the Phase 2 domain model into concrete Colyseus room state structures for `LobbyRoom` and `MonopolyRoom`.

This step defines what state should be synchronized to clients, what should remain server-only, and how room-level state should be organized for the MVP.

## Modeling Principles for Colyseus State

- Only synchronize data that clients need for rendering or interaction decisions
- Keep room state explicit and flat enough to avoid unnecessary complexity
- Avoid placing transient server-only calculation helpers into synchronized schema
- Separate pre-match state from active match state
- Prefer stable IDs and enums over duplicated derived fields

## Recommended Room Split

Use two Colyseus room types:

- `LobbyRoom`
- `MonopolyRoom`

Reason:

- lobby behavior and gameplay behavior are different domains
- synchronization needs are different before and during a match
- lifecycle handling is clearer
- reconnect logic is easier to reason about

## 1. LobbyRoom State Design

`LobbyRoom` exists before gameplay starts.

It should synchronize only the state needed for lobby UI, readiness, host controls, and match-start flow.

### Recommended `LobbyRoomState`

Suggested top-level fields:

- `lobbyId`
- `status`
- `hostPlayerId`
- `minPlayers`
- `maxPlayers`
- `playerCount`
- `players`
- `canStartMatch`
- `createdAt`

### Field Purpose

#### `lobbyId`

- stable room identifier for display and room joining

#### `status`

Suggested values:

- `waiting`
- `starting`
- `closed`

Purpose:

- drive lobby screen behavior
- control whether join, ready, and start actions are allowed

#### `hostPlayerId`

Purpose:

- identify who can press the `Start Match` button in the frontend

#### `minPlayers` and `maxPlayers`

Purpose:

- expose room constraints to UI
- support capacity display and start validation feedback

#### `playerCount`

Purpose:

- simplify lobby rendering without requiring client-side counting logic

#### `players`

Type concept:

- collection of `LobbyPlayerState`

Purpose:

- display joined players
- show ready state
- show host flag

#### `canStartMatch`

Purpose:

- derived server-owned flag for UI convenience
- true only when host-start conditions are satisfied

#### `createdAt`

Purpose:

- optional display and debugging metadata

### Recommended `LobbyPlayerState`

Suggested fields:

- `playerId`
- `displayName`
- `isHost`
- `isReady`
- `joinedAt`

Purpose:

- enough information to render the waiting room cleanly
- no match-only state belongs here

## LobbyRoom State That Should Not Be Synchronized

These should remain server-only if they exist:

- internal matchmaking or indexing helpers
- security/session tokens
- room creation validation internals
- raw websocket or connection references
- server timers that do not affect visible UI directly

## 2. MonopolyRoom State Design

`MonopolyRoom` exists only for the active match.

It should synchronize the minimum complete game state required for clients to render the board, HUD, player panels, and result screen.

### Recommended `MonopolyRoomState`

Suggested top-level fields:

- `matchId`
- `sourceLobbyId`
- `status`
- `startedAt`
- `finishedAt`
- `players`
- `board`
- `turn`
- `result`

### Field Purpose

#### `matchId`

- stable identifier for the active match

#### `sourceLobbyId`

- optional traceability back to the originating lobby

#### `status`

Suggested values:

- `playing`
- `finished`

Purpose:

- drive gameplay and result screen modes

#### `startedAt` and `finishedAt`

Purpose:

- support summary UI, debugging, and persistence hooks

#### `players`

Type concept:

- collection of `MatchPlayerState`

Purpose:

- expose each player's gameplay status, position, money, and connectivity state relevant to the match

#### `board`

Type concept:

- `BoardState`

Purpose:

- expose classic 40-tile layout and ownership-related state needed by the client

#### `turn`

Type concept:

- `TurnState`

Purpose:

- expose whose turn it is and what phase the match is currently in

#### `result`

Type concept:

- nullable `MatchResultState`

Purpose:

- provide final result information when the game ends

## Recommended `MatchPlayerState`

Suggested fields:

- `playerId`
- `displayName`
- `turnOrder`
- `position`
- `balance`
- `isBankrupt`
- `isAbandoned`
- `jail`
- `connection`

### Field Guidance

#### `playerId`, `displayName`

- needed throughout the UI

#### `turnOrder`

- supports turn indicators and turn order display

#### `position`

- current tile index on the 40-tile board

#### `balance`

- current money value for HUD and score panels

#### `isBankrupt`, `isAbandoned`

- explicit flags for elimination state
- useful for UI without requiring the client to infer reasons from connection and money fields

#### `jail`

Type concept:

- `JailState`

Purpose:

- keep jail details grouped rather than scattered across player fields

#### `connection`

Type concept:

- `ConnectionState`

Purpose:

- expose reconnect and abandonment state relevant to the match

## Recommended `JailState`

Suggested fields:

- `isInJail`
- `turnsRemaining`

Purpose:

- exactly enough for MVP rendering and rule handling

## Recommended `ConnectionState`

Suggested fields:

- `status`
- `reconnectDeadlineAt` optional

Purpose:

- enough for UI to show reconnect/reserved state when relevant

Note:

- `disconnectedAt` can remain server-only unless the frontend truly needs it

## Recommended `BoardState`

Suggested top-level fields:

- `boardId`
- `tileCount`
- `tiles`
- `properties`

Reason:

- keep static board layout separate from dynamic property ownership state if desired
- this makes it easier to reuse tile definitions and update ownership independently

### Recommended `BoardTileState`

Suggested fields:

- `tileIndex`
- `tileType`
- `name`
- `propertyId` optional
- `taxAmount` optional
- `targetTileIndex` optional

Purpose:

- enough to render and interpret each tile type on the client

### Recommended `PropertyState`

Suggested fields:

- `propertyId`
- `tileIndex`
- `name`
- `purchasePrice`
- `rentAmount`
- `ownerPlayerId` nullable

Purpose:

- keep dynamic ownership and property values explicit
- support property panels and owner highlights in UI

## Recommended `TurnState`

Suggested fields:

- `turnNumber`
- `activePlayerId`
- `phase`
- `diceTotal`
- `diceValueA`
- `diceValueB`
- `currentTileIndex`
- `canBuyCurrentProperty`
- `awaitingInput`

### Field Guidance

#### `turnNumber`

- supports logs, debugging, and UI labels

#### `activePlayerId`

- needed for highlighting active player

#### `phase`

- required for command availability and UI button states

#### `diceTotal`, `diceValueA`, `diceValueB`

- supports dice display and movement explanation

#### `currentTileIndex`

- helps the UI know which tile is being resolved now

#### `canBuyCurrentProperty`

- convenient derived flag for enabling purchase UI

#### `awaitingInput`

- indicates whether the room is waiting for a player decision versus running server resolution

## Recommended `MatchResultState`

Suggested fields:

- `winnerPlayerId`
- `endReason`
- `finishedAt`

Optional later:

- placements
- stats summary

Purpose:

- enough to render the result screen and support persistence handoff

## Synchronized State vs Server-Only Runtime State

This distinction is important.

### Should Be Synchronized

- lobby status
- joined players and ready flags
- host player ID
- match status
- player positions and balances
- ownership state
- turn state
- jail state
- visible connection state
- final result state

### Should Stay Server-Only

- command validation internals
- timer handles
- scheduled timeout callbacks
- raw session/socket references
- derived caches
- anti-cheat internals
- persistence service state
- room transition locks

## Recommended Collections Strategy

For Colyseus, the design should favor collections keyed by stable IDs where appropriate.

Recommended patterns:

- `players` keyed by `playerId`
- `properties` keyed by `propertyId`
- `tiles` stored as ordered array or map keyed by tile index

Reason:

- player and property lookup by ID is common
- board tile order is naturally positional

## Recommended State Ownership Rules

### LobbyRoom Owns

- lobby lifecycle state
- ready status
- host information
- start eligibility state

### MonopolyRoom Owns

- full gameplay state
- turn resolution state
- property ownership
- player economy state
- jail and connection state
- final result state

### PostgreSQL Owns

- user profile persistence
- completed match records
- statistics and leaderboard data
- historical transaction records if later stored

## Notes on Client Rendering Needs

The frontend should be able to render all MVP screens using synchronized room state plus static app config.

That means clients should not need hidden server data to render:

- lobby player list
- ready states
- current turn owner
- current positions
- property ownership
- eliminated players
- result screen

## Step 2 Deliverables

This step should produce:

- a proposed `LobbyRoomState`
- a proposed `MonopolyRoomState`
- nested state concepts for players, board, turn, jail, connection, and results
- a clear split between synchronized state and server-only runtime state
- guidance for keyed collections and room ownership boundaries

## Exit Criteria

Step 2 is complete when:

- each room has a clear synchronized state shape
- room state boundaries are explicit
- server-only data is clearly separated from client-visible state
- Phase 2 Step 3 can define command contracts against these room states without ambiguity
