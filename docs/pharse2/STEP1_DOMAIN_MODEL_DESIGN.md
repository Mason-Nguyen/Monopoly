# Phase 2 - Step 1: Domain Model Design

## Objective

Define the core domain entities for the Monopoly game so later documents can map them into Colyseus room state, shared types, and persistence models.

This step defines what the system talks about, what each concept is responsible for, and how the major entities relate to one another.

## Modeling Principles

- Domain model comes from game rules, not from UI screens
- Live match state and database persistence are related but not identical
- Entities should represent business meaning clearly
- Derived values should be computed by the server when possible
- Lobby concepts and active match concepts should stay separate

## Top-Level Domain Areas

The MVP domain should be split into these main areas:

- Lobby domain
- Match domain
- Player domain
- Turn domain
- Board domain
- Economy domain
- Connection domain
- Result domain

## 1. Lobby Domain

The lobby domain exists before a match starts.

### `Lobby`

Purpose:

- represents the pre-match room where players gather and prepare

Core responsibilities:

- track lobby identity
- track host player
- track joined players
- track readiness
- enforce capacity and start conditions
- initiate the transition into active match creation

Suggested core fields:

- `lobbyId`
- `hostPlayerId`
- `status`
- `maxPlayers`
- `minPlayers`
- `players`
- `createdAt`

### `LobbyPlayer`

Purpose:

- represents a player's membership in the lobby before the match begins

Core responsibilities:

- track whether the player is present in the lobby
- track ready status
- track join order for display or host reassignment logic

Suggested core fields:

- `playerId`
- `displayName`
- `isHost`
- `isReady`
- `joinedAt`

## 2. Match Domain

The match domain begins once the host starts the game and the server creates the active game room.

### `Match`

Purpose:

- represents the overall active game session

Core responsibilities:

- track match lifecycle
- track active players
- own the board, turn, and outcome state
- manage gameplay progression until finish

Suggested core fields:

- `matchId`
- `lobbyId` or `sourceLobbyId`
- `status`
- `players`
- `board`
- `turn`
- `startedAt`
- `finishedAt`
- `winnerPlayerId`

### `MatchPlayer`

Purpose:

- represents a player's live participation inside a running match

Core responsibilities:

- track board position
- track balance
- track elimination and jail state
- track owned properties indirectly or directly depending on implementation
- track connection state relevant to the match

Suggested core fields:

- `playerId`
- `displayName`
- `turnOrder`
- `position`
- `balance`
- `isBankrupt`
- `isAbandoned`
- `isInJail`
- `connectionStatus`

Note:

- `LobbyPlayer` and `MatchPlayer` should remain separate concepts even if they share some fields
- readiness belongs to lobby only
- money and board position belong to match only

## 3. Player Domain

The player domain contains the player identity used across lobby, match, and persistence contexts.

### `Player`

Purpose:

- represents a human participant identity within the game system

Core responsibilities:

- provide stable identity across rooms and sessions
- carry public display metadata needed in gameplay and lobby contexts

Suggested core fields:

- `playerId`
- `displayName`
- `avatarKey` optional later
- `isGuest`

Note:

- authentication and profile storage can extend this later in API design
- for gameplay modeling, only minimal identity is required now

## 4. Turn Domain

The turn domain describes whose turn it is, what phase the turn is in, and what inputs are currently allowed.

### `TurnState`

Purpose:

- represents the active turn in the running match

Core responsibilities:

- track current player
- track turn number
- track turn phase
- store latest dice result
- indicate whether optional action is available
- control command validation

Suggested core fields:

- `turnNumber`
- `activePlayerId`
- `phase`
- `diceTotal`
- `diceValues` optional
- `currentTileIndex`
- `canBuyCurrentProperty`
- `awaitingInput`

### `TurnPhase`

Suggested values:

- `await_roll`
- `resolving_movement`
- `resolving_tile`
- `await_optional_action`
- `await_end_turn`
- `turn_complete`

Reason:

- these already match Phase 1 decisions
- they should become a shared enum in implementation later

## 5. Board Domain

The board domain models the classic 40-tile game board.

### `Board`

Purpose:

- represents the full board layout used by the active match

Core responsibilities:

- store ordered tiles
- define movement path
- provide lookup for tile resolution by position

Suggested core fields:

- `boardId`
- `tiles`
- `tileCount`

### `BoardTile`

Purpose:

- represents a single tile on the board

Core responsibilities:

- identify tile type
- hold tile-specific config data
- support resolution logic when a player lands on it

Suggested core fields:

- `tileIndex`
- `tileType`
- `name`
- `propertyId` optional
- `taxAmount` optional
- `targetTileIndex` optional for `go_to_jail`

### `TileType`

Suggested MVP values:

- `start`
- `property`
- `tax`
- `jail`
- `go_to_jail`
- `free_parking`
- `neutral`

## 6. Economy Domain

The economy domain models ownership and mandatory money flow.

### `Property`

Purpose:

- represents a purchasable board asset

Core responsibilities:

- define purchase cost
- define rent amount
- define ownership state

Suggested core fields:

- `propertyId`
- `tileIndex`
- `name`
- `purchasePrice`
- `rentAmount`
- `ownerPlayerId` nullable

### `Payment`

Purpose:

- represents a mandatory or explicit money transfer in the rules engine

Core responsibilities:

- describe who pays
- describe who receives or whether the amount goes to bank
- describe reason and amount

Suggested core fields:

- `paymentId` optional
- `fromPlayerId`
- `toPlayerId` nullable
- `amount`
- `reason`

### `PaymentReason`

Suggested MVP values:

- `property_purchase`
- `rent`
- `tax`
- `start_salary`

Note:

- even if not persisted immediately, having this concept makes server-side rule resolution clearer

## 7. Jail Domain

Jail is important enough in MVP to deserve its own small model, even though the rules are simple.

### `JailState`

Purpose:

- track whether a player is in jail and when release should happen

Core responsibilities:

- indicate jailed status
- track skipped turns remaining

Suggested core fields:

- `isInJail`
- `turnsRemaining`

Reason:

- this is clearer than overloading generic player flags
- future jail expansion becomes easier later

## 8. Connection Domain

The connection domain exists because reconnect and abandonment are part of MVP behavior.

### `ConnectionState`

Purpose:

- track live match connectivity state for each match player

Core responsibilities:

- distinguish connected from temporarily disconnected players
- support reconnect window logic
- support abandonment handling

Suggested core fields:

- `status`
- `disconnectedAt` optional
- `reconnectDeadlineAt` optional

### `ConnectionStatus`

Suggested MVP values:

- `connected`
- `disconnected_reserved`
- `reconnected`
- `abandoned`

## 9. Result Domain

The result domain captures how the match ended and what the outcome was.

### `MatchResult`

Purpose:

- represent the final outcome of a finished match

Core responsibilities:

- identify winner
- identify eliminated players
- provide summary data for persistence and UI

Suggested core fields:

- `winnerPlayerId`
- `finishedAt`
- `placements` optional later
- `endReason`

### `MatchEndReason`

Suggested MVP values:

- `last_player_remaining`
- `all_others_bankrupt`
- `all_others_abandoned`
- `manual_termination_dev_only` optional later

## Core Relationships

The MVP domain relationships should look like this:

- one `Lobby` has many `LobbyPlayer`
- one `Lobby` may create one `Match`
- one `Match` has many `MatchPlayer`
- one `Match` has one `Board`
- one `Board` has many `BoardTile`
- one `Match` has one `TurnState`
- one `Match` has many `Property` ownership states
- one `MatchPlayer` has one `JailState`
- one `MatchPlayer` has one `ConnectionState`
- one finished `Match` has one `MatchResult`

## Domain Boundary Guidance

These concepts belong to live Colyseus state:

- lobby membership and ready state
- active match player state
- turn state
- board tile positions
- property ownership
- jail state
- connection state

These concepts are persistence-oriented and may be stored in PostgreSQL separately:

- user profile
- historical match summary
- leaderboard statistics
- transaction history

Important:

- do not force the live room model to look exactly like the database model
- room state should optimize for gameplay and synchronization first

## Recommended Shared Enums to Introduce Later

Phase 2 should likely create shared enums for:

- `LobbyStatus`
- `MatchStatus`
- `TurnPhase`
- `TileType`
- `ConnectionStatus`
- `PaymentReason`
- `MatchEndReason`

## Minimum Stable IDs Needed

The modeling baseline should use explicit stable IDs for:

- `playerId`
- `lobbyId`
- `matchId`
- `propertyId`
- `boardId` if needed

Tile index can remain positional rather than ID-based if preferred.

## Step 1 Deliverables

This step should produce:

- a list of core entities
- responsibilities for each entity
- field candidates for each entity
- domain boundaries for lobby, match, and persistence concerns
- relationship mapping between major entities

## Exit Criteria

Step 1 is complete when:

- the core game concepts are named clearly
- each major entity has a purpose
- live match concepts are separated from persistence concepts
- Phase 2 Step 2 can map these concepts into Colyseus room state cleanly
