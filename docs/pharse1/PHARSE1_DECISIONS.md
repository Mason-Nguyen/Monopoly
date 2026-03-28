# Phase 1 - MVP Decisions Log

## Purpose

This file records the working decisions for Phase 1.

Unless replaced later, these decisions should be treated as the baseline for MVP planning.

## Decision Status Legend

- Proposed: recommended default, not yet final
- Confirmed: accepted and locked for the MVP
- Deferred: intentionally moved to a later phase

## Step 1 - MVP Boundary

### Supported Player Count

Decision:

- Production room size supports 4 to 6 players
- Development and test rooms may allow 2 to 6 players through configuration

Status:

- Confirmed

### Match Start Requirement

Decision:

- A production match starts only when at least 4 players are in the room and every joined player is ready

Status:

- Confirmed

### Room Start Ownership

Decision:

- Use a room owner or host concept for lobby presentation, but the server decides whether the game may start

Status:

- Confirmed

### Match Start Trigger

Decision:

- The host manually presses `Start Match`
- The server allows the start only when all joined players are ready and minimum player count is met

Status:

- Confirmed

### MVP Gameplay Features Included

Decision:

- Lobby creation and joining
- Ready / unready flow
- Host-triggered match start
- Turn order initialization
- Roll dice
- Move token
- Resolve landed tile
- Buy unowned property
- Pay rent on owned property
- End turn
- Basic jail state
- Bankruptcy elimination
- Match end when one player remains

Status:

- Confirmed

### MVP Features Explicitly Excluded

Decision:

- Trading
- Mortgage
- Houses and hotels
- Chance and community chest full system
- Bot players
- Matchmaking
- Spectator mode
- Cosmetics and skins
- Voice chat
- Advanced visual polish

Status:

- Confirmed

## Step 2 - Match Lifecycle Baseline

### Room States

Decision:

- LobbyRoom: `waiting`, `starting`, `closed`
- MonopolyRoom: `playing`, `finished`

Status:

- Confirmed

### Match Start Behavior

Decision:

- The host may request match start
- The server transitions the room into match start flow only if all joined players are ready and start validation passes

Status:

- Confirmed

## Step 3 - Turn Lifecycle Baseline

### Mandatory Turn Actions

Decision:

- `rollDice`
- `buyProperty` when eligible
- `endTurn`

Status:

- Confirmed

### Turn Sequence

Decision:

1. Active player rolls dice
2. Server resolves movement
3. Server resolves the landing tile
4. If the tile is purchasable and unowned, player may buy it
5. If payment is required, server processes it
6. Player ends the turn
7. Server advances to the next player

Status:

- Confirmed

## Step 4 - Economy and Tile Baseline

### Starting Money

Decision:

- All players start with `1500`

Status:

- Confirmed

### Salary for Start

Decision:

- A player receives `200` when passing or landing on `Start`

Status:

- Confirmed

### Board Scope

Decision:

- MVP uses the classic Monopoly-style board with `40` tiles
- Rules remain simplified even though the board layout is classic

Status:

- Confirmed

### Jail

Decision:

- MVP uses simplified jail rules
- A jailed player skips exactly `1` full turn and is then automatically released

Status:

- Confirmed

### Chance and Community Cards

Decision:

- Excluded from MVP

Status:

- Confirmed

### Free Parking

Decision:

- No bonus effect in MVP

Status:

- Confirmed

### Bankruptcy

Decision:

- If a player cannot pay a required amount in MVP, that player is eliminated from active play and owned properties return to the bank as unowned

Status:

- Confirmed

## Step 5 - Failure and Edge Cases Baseline

### Reconnect Window

Decision:

- A disconnected player has `90 seconds` to reconnect during an active match

Status:

- Confirmed

### Match Start Transfer Timeout

Decision:

- Players have `30 seconds` to complete transfer from lobby flow into the active Monopoly room

Status:

- Confirmed

### Idle Turn Timeout

Decision:

- The active connected player has `60 seconds` to act during input phases

Status:

- Confirmed

### Active Player Disconnect

Decision:

- If the active player disconnects, the turn is paused until reconnect or timeout expiry
- If reconnect timeout expires, the player becomes abandoned and is removed from active play

Status:

- Confirmed

### Non-Active Player Disconnect

Decision:

- If a non-active player disconnects, the match continues while the slot is reserved during the reconnect window
- If reconnect timeout expires, the player becomes abandoned and is removed from active play

Status:

- Confirmed

### Idle Auto-Resolution

Decision:

- `await_roll` -> auto-roll
- `await_optional_action` -> auto-decline purchase
- `await_end_turn` -> auto-end turn

Status:

- Confirmed

## Items Still Needing Confirmation

- None for Phase 1

## Recommended Next Action

To continue after Phase 1:

- create Phase 2 state model documents
- define Colyseus room state schema
- define shared command and payload contracts
