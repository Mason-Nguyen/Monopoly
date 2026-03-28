# Phase 2 - Domain and State Modeling

## Purpose

Phase 2 converts the signed-off MVP rules from Phase 1 into concrete system models.

This phase defines the core domain objects, Colyseus room state structure, command contracts, and payload shapes that later phases will implement.

## Phase 2 Goal

Create a stable modeling baseline for:

- game domain entities
- Colyseus room state
- shared enums and identifiers
- client-to-server commands
- server-to-client payloads
- classic 40-tile board configuration structure

## Inputs from Phase 1

Phase 2 must respect all confirmed Phase 1 decisions, including:

- 4 to 6 players in production matches
- host-triggered match start
- `LobbyRoom` and `MonopolyRoom` separation
- classic 40-tile board
- simplified economy and jail rules
- authoritative server gameplay
- reconnect, idle, and abandonment behavior

## Phase 2 Deliverables

By the end of Phase 2, the project should have:

- domain model documentation
- room state model documentation
- command contract documentation
- event and payload documentation
- board configuration model documentation
- recommended shared type boundaries for implementation

## Recommended Step Order

### Step 1 - Domain Model Design

Focus:

- define the business entities and their responsibilities
- define which concepts belong to lobby, match, player, board, turn, and result domains

Output:

- domain model document

### Step 2 - Colyseus Room State Design

Focus:

- define what belongs in `LobbyRoom` state
- define what belongs in `MonopolyRoom` state
- identify fields that must be synchronized to clients

Output:

- room state document

### Step 3 - Command Contract Design

Focus:

- define commands sent from client to server
- define validation expectations for each command
- define which room and phase can accept each command

Output:

- command contract document

### Step 4 - Event and Payload Design

Focus:

- define server-to-client events and payload shapes
- define when state sync alone is enough and when explicit events help UX

Output:

- event and payload document

### Step 5 - Board Configuration Model

Focus:

- define data model for classic 40-tile board configuration
- define tile config shape and property config shape

Output:

- board config model document

### Step 6 - Phase 2 Sign-Off

Focus:

- freeze modeling decisions before project setup and implementation

Output:

- Phase 2 sign-off document

## Working Principles for Phase 2

- model first, implementation later
- keep names explicit and stable
- separate persistent data from live room state
- keep Colyseus state minimal but sufficient
- keep room state different from database schema when needed
- prefer server-owned derived values over duplicated client-owned state

## Expected Handoff After Phase 2

Once Phase 2 is complete, the next phase should be able to:

- scaffold shared TypeScript types
- scaffold Colyseus schema classes
- scaffold API DTOs
- scaffold board config files
- begin project setup with lower rework risk
