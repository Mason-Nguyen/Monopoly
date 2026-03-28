# Step 1 - MVP Boundary Summary

## Objective

Lock the boundary of the first playable version so later phases do not reopen basic scope decisions.

## One-Paragraph MVP Definition

The MVP is a browser-based Monopoly-style multiplayer game for 4 to 6 players where users can create or join a room, ready up, start a match, take turns rolling dice, move across the board, buy unowned properties, pay rent on owned properties, handle a simplified jail state, become bankrupt when unable to pay, and end the game when only one player remains.

## Included in MVP

- Create room
- Join room
- Leave room before game start
- Ready / unready
- Server-validated game start
- Randomized turn order at match start
- Roll dice
- Move token
- Resolve landed tile
- Buy unowned property
- Pay rent
- End turn
- Basic jail state
- Bankruptcy elimination
- Match end detection

## Excluded from MVP

- Trading
- Mortgage
- Houses and hotels
- Chance / community chest full system
- Bot players
- Matchmaking
- Spectator mode
- Cosmetics
- Voice chat
- Advanced board polish
- Advanced animation polish

## Working Assumptions

- Production matches require at least 4 players
- Development mode may allow smaller room sizes for testing
- The server remains authoritative for room start and all gameplay actions
- All joined players must be ready before the match starts
- Free parking has no bonus effect in MVP
- If a player cannot pay, the player becomes bankrupt

## What Step 1 Must Produce

- Clear MVP definition
- Clear included feature list
- Clear excluded feature list
- No ambiguity about whether advanced Monopoly systems belong in MVP

## Exit Criteria

Step 1 is complete when:

- the MVP can be explained in one paragraph
- the included and excluded features are stable
- the team agrees not to pull deferred features back into MVP without explicit scope change
