# Phase 1 - Step-by-Step Workflow

## Purpose

This document turns Phase 1 into an execution workflow.

Use this file to track the order of work, expected outputs, and completion criteria for each step.

## Phase 1 Objective

Define a stable MVP ruleset for the Monopoly web game before moving into system design and implementation.

## Execution Order

### Step 1 - Lock MVP Boundary

Goal:

- Decide exactly what is included in the first playable version.

Tasks:

- Confirm supported player count
- Confirm minimum player count to start a real match
- Confirm required room flow
- Confirm the list of must-have gameplay features
- Confirm the list of excluded features

Output:

- agreed MVP scope
- agreed out-of-scope list

Done when:

- the team can describe the MVP in one short paragraph
- there is no confusion about which features are delayed

Status:

- In progress

### Step 2 - Define Match Lifecycle

Goal:

- Describe the game flow from room creation to match end.

Tasks:

- define room creation flow
- define join / leave behavior
- define ready / unready flow
- define how a match starts
- define when a room becomes an active game room
- define when a match ends

Output:

- match lifecycle description
- room state transitions

Done when:

- a reader can follow the room flow without referring to implementation details

Status:

- Pending

### Step 3 - Define Turn Lifecycle

Goal:

- Make the turn system precise enough for Phase 2 modeling.

Tasks:

- define what a player can do during a turn
- define when dice can be rolled
- define how movement is resolved
- define follow-up actions after landing
- define how a turn ends
- define how the next player is selected

Output:

- turn lifecycle definition
- turn action list

Done when:

- all valid player actions can be listed in order

Status:

- Pending

### Step 4 - Define Tile and Economy Rules

Goal:

- Confirm the minimal rules needed for a playable Monopoly economy.

Tasks:

- define starting money
- define salary when passing start if included
- define property ownership rules
- define rent rules
- define bankruptcy trigger
- define simplified jail behavior
- decide whether chance/community cards exist in MVP

Output:

- economy rules summary
- tile behavior summary

Done when:

- the rules engine can be outlined without unresolved money or tile questions

Status:

- Pending

### Step 5 - Define Failure and Edge-Case Rules

Goal:

- Cover the minimum real-world gameplay issues that affect MVP scope.

Tasks:

- define disconnect behavior
- define reconnect window
- define AFK expectation
- define what happens if a player cannot pay
- define what happens if a player leaves before game start
- define what happens if a player leaves during a game

Output:

- edge-case rules summary

Done when:

- MVP behavior is predictable for disconnect and bankruptcy cases

Status:

- Pending

### Step 6 - Sign Off Phase 1

Goal:

- Freeze the Phase 1 outputs and prepare Phase 2.

Tasks:

- review all decisions
- resolve any remaining open questions
- update checklist
- mark the final scope as approved

Output:

- approved Phase 1 package

Done when:

- Phase 2 can begin without reopening MVP scope discussions

Status:

- Pending

## Phase 1 Deliverable Set

By the end of this phase, the `docs/pharse1` folder should contain:

- the high-level phase plan
- the phase workflow
- the current MVP decisions
- any rules summary or sign-off notes created during the phase

## Recommended Working Method

Execute Phase 1 in this order:

1. Step 1 - Lock MVP Boundary
2. Step 2 - Define Match Lifecycle
3. Step 3 - Define Turn Lifecycle
4. Step 4 - Define Tile and Economy Rules
5. Step 5 - Define Failure and Edge-Case Rules
6. Step 6 - Sign Off Phase 1

## Current Focus

Current active step:

- Step 1 - Lock MVP Boundary

Current immediate goals:

- finalize MVP scope
- finalize out-of-scope features
- remove ambiguity around what Phase 1 must produce
