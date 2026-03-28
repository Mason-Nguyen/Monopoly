# Phase 1 - MVP Rules and Scope

## Purpose

This document defines everything that must be agreed on before implementation starts.

Phase 1 focuses on:

- locking the MVP scope
- defining the core gameplay loop
- listing the allowed player actions
- identifying what is out of scope for the first version

This file should be used as the working reference for all decisions in Phase 1.

## Phase 1 Goals

- Define the first playable version of the Monopoly web game
- Keep the scope small enough for an MVP
- Make gameplay rules clear before architecture and implementation continue
- Ensure all later phases build on a stable ruleset

## MVP Scope

The MVP supports:

- 4 to 6 players per room
- browser-based multiplayer gameplay
- room creation and room joining
- ready / unready flow before match start
- turn-based gameplay
- dice rolling
- player movement across the board
- buying unowned property
- paying rent on owned property
- passing turns
- basic jail behavior
- player elimination when bankrupt
- match end when one player remains

## Core Gameplay Loop

The initial match loop should work like this:

1. Players enter a room.
2. Players mark themselves as ready.
3. Host or room logic starts the match when conditions are met.
4. Each turn, the active player rolls dice.
5. The player token moves based on the dice result.
6. The tile effect is resolved by the server.
7. The player may perform a valid follow-up action when applicable.
8. The player ends the turn.
9. The next player begins.
10. The game continues until only one player remains solvent.

## Must-Have Features in Phase 1

### Room and Match Setup

- create room
- join room
- leave room before game start
- ready / unready
- start game when enough players are ready

### Turn Actions

- roll dice
- move token
- resolve landed tile
- buy property if eligible
- pay rent if required
- end turn

### Match Rules

- determine player order
- track player balance
- track owned properties
- track current tile position
- handle jail state
- eliminate bankrupt player
- detect end of match

## Player Actions to Define Clearly

These actions need exact rules during Phase 1:

- `ready`
- `unready`
- `rollDice`
- `buyProperty`
- `endTurn`

Possible later actions, but not required yet:

- `useCard`
- `trade`
- `mortgage`
- `buildHouse`

## State Items That Must Exist by the End of Phase 1

- room status
- list of players in room
- player ready status
- turn order
- active player
- player balance
- player board position
- property ownership
- jail status
- match result state

## Business Rules to Confirm in Phase 1

These rules should be written down and approved before moving forward:

- minimum players needed to start
- whether 4 players is required or if fewer are allowed for testing
- how turn order is decided
- starting money amount
- what happens when a player disconnects
- what happens if a player cannot pay rent
- whether jail is simplified in MVP
- whether chance/community cards are excluded in MVP
- whether free parking has special behavior or is just a normal tile

## Recommended Rule Decisions for MVP

To keep implementation simple, the recommended first-version decisions are:

- minimum start count for production gameplay: 4 players
- local test mode may allow fewer players if needed
- turn order is randomized once at match start
- starting money is fixed and identical for all players
- disconnect handling is simple at first: temporary reconnect window
- if a player cannot pay, they are bankrupt
- jail uses a simplified rule set
- chance/community cards are excluded from the first playable version
- free parking has no bonus effect in MVP

## Out of Scope for Phase 1

These features should not block the MVP definition:

- trading between players
- mortgage system
- houses and hotels
- chance / community chest full system
- AI or bot players
- matchmaking
- cosmetics or skins
- voice chat
- spectator mode
- leaderboard balancing rules
- advanced animations
- mobile-specific polish

## Deliverables for Phase 1

By the end of Phase 1, we should have:

- a confirmed MVP feature list
- a confirmed out-of-scope list
- a confirmed gameplay loop
- a confirmed set of player actions
- a confirmed list of core game state items
- a list of open questions that must be answered in Phase 2 if still unresolved

## Phase 1 Checklist

- [ ] Confirm supported player count and minimum start condition
- [ ] Confirm MVP gameplay loop
- [ ] Confirm mandatory player actions
- [ ] Confirm excluded features
- [ ] Confirm simplified jail rules
- [ ] Confirm bankruptcy behavior
- [ ] Confirm end-game condition
- [ ] Confirm disconnect/reconnect expectation for MVP
- [ ] Sign off Phase 1 scope before Phase 2

## Open Questions

Use this section to record decisions as we go.

- Should test rooms allow fewer than 4 players?
- Will there be a designated host, or will the server manage start conditions automatically?
- Do we want all classic Monopoly tiles in MVP, or a reduced board first?
- Is the board theme fixed from the start, or can visuals stay placeholder during early development?

## Next Step After Phase 1

Once this file is confirmed, Phase 2 should begin with:

- domain model design
- Colyseus room state design
- player action contract design
- event and payload definition
