# Step 2 - Match Lifecycle Definition

## Objective

Define the full room and match lifecycle for the MVP, from lobby creation to match completion.

This document focuses on flow and state transitions, not low-level implementation.

## Lifecycle Summary

The MVP match lifecycle follows this sequence:

1. A player creates a lobby.
2. Other players join the lobby until the room reaches the required size.
3. Players set their ready status.
4. When start conditions are satisfied, the server moves the room into the start process.
5. A dedicated Monopoly match room is created.
6. Players are placed into the active match room.
7. The match runs until only one player remains active.
8. The match is marked as finished and result data is persisted.

## Recommended Room Model

For the MVP, use two room concepts:

- `LobbyRoom`: pre-match waiting room
- `MonopolyRoom`: active gameplay room

Reason:

- Lobby and gameplay have different responsibilities
- Ready flow is simpler in a waiting room
- Active game logic stays isolated from pre-match logic
- This structure fits Colyseus cleanly

## Match Lifecycle Stages

### Stage 1 - Lobby Created

Description:

- A player creates a lobby room.
- The creating player becomes the lobby owner for presentation purposes.
- The server remains authoritative for all validation.

Rules:

- The room starts in `waiting` state.
- The room has a maximum capacity of 6 players.
- The room is joinable only while it is in `waiting` state.

### Stage 2 - Players Join Lobby

Description:

- Players join the lobby until the room is ready to start.

Rules:

- Only players joining before match start are allowed into the lobby.
- A player may leave freely while the lobby is still in `waiting` state.
- If the owner leaves before match start, ownership is reassigned automatically.
- If all players leave, the lobby is closed.

### Stage 3 - Ready Flow

Description:

- Players declare whether they are ready to begin.

Rules:

- Each joined player has a `ready` flag.
- Players may toggle ready and unready while the room is in `waiting` state.
- A production match can start only when at least 4 players are present.
- For MVP, all currently joined players must be ready before start.

### Stage 4 - Match Starting

Description:

- The server locks the lobby and prepares the active game room.

Rules:

- Lobby state changes from `waiting` to `starting`.
- No new players may join once the room is `starting`.
- No player may toggle readiness once start processing begins.
- The server randomizes turn order.
- The server creates the initial Monopoly game state.
- The server creates or activates the `MonopolyRoom` for this match.

### Stage 5 - Active Match

Description:

- Players are connected to the active Monopoly room and gameplay begins.

Rules:

- Match room state is `playing`.
- No new players may join the running game.
- All gameplay actions are validated by the server.
- Turn order is fixed for the match unless later rules explicitly change it.
- The game continues until only one non-bankrupt player remains.

### Stage 6 - Match Finished

Description:

- The match ends and the result is finalized.

Rules:

- Match room state changes to `finished`.
- The server records the winner and player outcomes.
- Persistent match data is written to PostgreSQL.
- The active match room is no longer joinable.
- A finished room may be destroyed after result persistence and a short grace period.

## Recommended Room States

### LobbyRoom States

- `waiting`
- `starting`
- `closed`

### MonopolyRoom States

- `playing`
- `finished`

## State Transition Summary

### LobbyRoom

- `waiting -> starting`
- `waiting -> closed`
- `starting -> closed`

### MonopolyRoom

- `playing -> finished`

## Transition Rules

### `waiting -> starting`

Triggered when:

- minimum player count is met
- all joined players are ready
- server start validation passes

### `waiting -> closed`

Triggered when:

- all players leave before match start
- the room is abandoned
- the room is canceled before match creation

### `starting -> closed`

Triggered when:

- match room creation fails
- all players disconnect before transfer completes
- startup is canceled by server-side failure handling

### `playing -> finished`

Triggered when:

- only one active player remains
- the match is force-terminated by an MVP admin flow in development, if implemented later

## Player Lifecycle Within a Match

### Before Match Start

A player can:

- create a room
- join a room
- leave a room
- toggle ready state

A player cannot:

- perform gameplay actions
- join a room that is already starting or playing

### During Match

A player can:

- remain connected to the Monopoly room
- perform valid actions only during their turn
- receive synchronized state updates

A player cannot:

- join a match already in progress as a new participant
- change match membership normally once the match has started

### After Match End

A player can:

- receive final result data
- return to lobby flow or main menu in the frontend

## Start Conditions for MVP

A match may start only if all of the following are true:

- room state is `waiting`
- player count is at least 4
- player count does not exceed 6
- every joined player is ready
- server successfully creates initial game state

## End Conditions for MVP

A match ends when:

- only one player remains non-bankrupt

Optional later expansion, not required now:

- player surrender
- admin cancellation
- timeout-based match termination

## Join and Leave Rules

### Join Rules

- New players may join only while lobby state is `waiting`
- Joining is blocked when the room is full
- Joining is blocked when the room is `starting`, `playing`, or `finished`

### Leave Rules Before Start

- Any player may leave while the lobby is `waiting`
- If the owner leaves, ownership is reassigned automatically
- If the room becomes empty, it is closed

### Leave Rules After Start

- Normal leaving is treated as disconnect/abandon behavior and is handled by match rules
- Detailed disconnect policy is defined in Step 5

## Server Authority Rules

For MVP, the server is authoritative over:

- player eligibility to join
- room start validation
- turn order generation
- active room creation
- gameplay progression
- match end detection
- result persistence

## Step 2 Deliverables

This step should produce:

- a clear lifecycle from lobby creation to match completion
- room state definitions
- state transition definitions
- match start and end conditions
- basic join / leave rules

## Exit Criteria

Step 2 is complete when:

- the room lifecycle is fully understandable without implementation details
- lobby flow and active match flow are clearly separated
- start and end conditions are explicit
- Phase 3 and Phase 7 can rely on this lifecycle model

## Notes for Later Steps

- Detailed disconnect and reconnect handling will be finalized in Step 5
- Detailed turn actions will be defined in Step 3
- Detailed tile and economy rules will be defined in Step 4
