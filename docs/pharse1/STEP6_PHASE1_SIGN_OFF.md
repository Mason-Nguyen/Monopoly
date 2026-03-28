# Step 6 - Phase 1 Sign-Off

## Objective

Finalize Phase 1 and freeze the MVP rules, lifecycle decisions, and failure-handling baseline before moving into Phase 2.

## Phase 1 Status

Phase 1 is now considered complete.

The MVP scope, gameplay loop, room lifecycle, turn lifecycle, economy rules, and edge-case handling rules are sufficiently defined for system modeling.

## Final MVP Definition

The MVP is a browser-based Monopoly-style multiplayer game for 4 to 6 players where users can create or join a lobby, ready up, and have the host manually start the match once all joined players are ready. Players take turns rolling dice, moving across a classic 40-tile board, buying unowned properties, paying rent and taxes automatically, handling a simplified jail rule, becoming eliminated when bankrupt or abandoned, and ending the game when only one active player remains.

## Final Phase 1 Decisions

### Match Setup

- 4 to 6 players for production matches
- Development and test configuration may allow fewer players
- A host exists for lobby presentation and start control
- The host manually presses `Start Match`
- The server validates minimum player count and ready state before allowing start

### Room Model

- `LobbyRoom` handles waiting and ready flow
- `MonopolyRoom` handles active gameplay
- Lobby states: `waiting`, `starting`, `closed`
- Match states: `playing`, `finished`

### Gameplay Loop

- Active player rolls dice
- Server resolves movement
- Server resolves landed tile
- Player may buy unowned property when eligible
- Server applies forced payment automatically
- Player ends turn
- Server advances to the next eligible player

### Turn Commands

- `rollDice`
- `buyProperty`
- `endTurn`

### Economy Rules

- Starting money: `1500`
- Passing or landing on `Start`: `200`
- Board: classic `40` tiles
- Free parking gives no bonus
- Taxes are fixed amounts
- Properties use simple fixed purchase and rent values
- No mortgage, trading, houses, hotels, utilities, railroads, auctions, or card systems in MVP

### Jail Rules

- `go_to_jail` sends the player directly to jail
- A jailed player skips exactly `1` full turn
- The player is then automatically released

### Bankruptcy and Abandonment

- If a player cannot pay a required amount, the player is eliminated
- If a reconnect timeout expires, the player becomes abandoned and is eliminated from active play
- In both cases, owned properties return to the bank as unowned

### Failure and Timeout Rules

- Reconnect window during live match: `90 seconds`
- Match-start room transfer timeout: `30 seconds`
- Idle timeout for active player input phases: `60 seconds`
- Idle actions are auto-resolved by the server using safe defaults

## Phase 1 Deliverables Completed

Completed documents in `docs/pharse1`:

- `PHARSE1_PLAN.md`
- `PHARSE1_WORKFLOW.md`
- `PHARSE1_DECISIONS.md`
- `STEP1_MVP_BOUNDARY.md`
- `STEP2_MATCH_LIFECYCLE.md`
- `STEP3_TURN_LIFECYCLE.md`
- `STEP4_TILE_AND_ECONOMY_RULES.md`
- `STEP5_FAILURE_AND_EDGE_CASE_RULES.md`
- `STEP6_PHASE1_SIGN_OFF.md`

## Phase 1 Checklist Result

- [x] Confirm supported player count and minimum start condition
- [x] Confirm MVP gameplay loop
- [x] Confirm mandatory player actions
- [x] Confirm excluded features
- [x] Confirm simplified jail rules
- [x] Confirm bankruptcy behavior
- [x] Confirm end-game condition
- [x] Confirm disconnect/reconnect expectation for MVP
- [x] Sign off Phase 1 scope before Phase 2

## What Phase 2 Should Start With

Phase 2 should now focus on:

- domain model design
- Colyseus room state design
- player action contract design
- event and payload definition
- board configuration model for the classic 40-tile board

## Handoff Guidance for Phase 2

Phase 2 should model at least these core state areas:

- room state
- player state
- turn state
- property ownership state
- tile definitions
- jail state
- connection status state
- match result state

Phase 2 should also define:

- shared enums
- Colyseus schema structure
- command payloads from client to server
- event payloads from server to client

## Sign-Off Statement

Phase 1 is approved as the planning baseline for MVP implementation and system modeling.
