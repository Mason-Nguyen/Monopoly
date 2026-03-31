# Phase 12 - 2.5D Board and Gameplay Scene

## Planning Basis

This phase is guided by the Game Studio plugin, mainly:

- `game-studio:react-three-fiber-game`
- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

The direction for Phase 12 is:

- keep simulation authority outside the render tree
- use React Three Fiber as the scene host inside the existing React app shell
- keep HUD and text-heavy UX in DOM while protecting the center playfield
- build a readable 2.5D tabletop scene before chasing asset polish

## Purpose

Phase 12 turns the Phase 11 functional match shell into a visually playable 2.5D match screen.

The purpose is not to replace the existing frontend shell, but to plug a dedicated board renderer into the already-reserved playfield area and let the HUD, event feed, and action controls coordinate cleanly with the scene.

## Phase 12 Goal

Build the first playable 2.5D board scene for the Monopoly match view so players can understand token positions, current turn, tile movement, and key board interactions directly from the scene.

## Inputs from Previous Phases

Phase 12 builds directly on:

- Phase 6 pure game-engine rules
- Phase 7 engine-backed room execution and gameplay events
- Phase 8 reconnect and idle runtime behavior
- Phase 10 verified room and persistence integration coverage
- Phase 11 functional web shell, match HUD, live room projections, and route-level chunking

## Required End State for Phase 12

By the end of Phase 12:

- the live match route hosts a real React Three Fiber board scene
- the board scene reads from live match state without taking rule ownership away from Colyseus
- token placement and step movement are visually understandable
- the DOM HUD and the scene coexist without crowding the viewport
- the scene is responsive on desktop and mobile
- the scene can later accept richer assets, effects, and polish without reworking the Phase 11 shell

## Implementation Rule for This Phase

For every step in Phase 12, the workflow is:

1. plan the step
2. write the step document
3. present a mockup UI or scene wireframe
4. wait for approval
5. implement real code only after approval

## Recommended Step Order

### Step 1 - Scene Scope and Playfield Composition

Focus:

- define the visual composition of the board scene inside the existing match shell
- define safe overlay zones and playfield protection rules
- define the first scene camera, board footprint, and token readability targets

Output:

- step document
- approved scene mockup

### Step 2 - Rendering Architecture and State Projection Plan

Focus:

- define the React Three Fiber scene tree
- define scene component boundaries, projection helpers, and animation data flow
- define where live room state is transformed into render-friendly board state

Output:

- step document
- approved scene architecture mockup

### Step 3 - Board Shell and Camera Plan

Focus:

- define the first board mesh strategy
- define camera angle, framing, and resizing behavior
- define how the classic 40-tile ring reads in 2.5D

Output:

- step document
- approved board and camera mockup

### Step 4 - Token and Tile Feedback Plan

Focus:

- define placeholder token style and placement logic
- define current tile highlight, active player emphasis, and move path readability
- define minimum feedback needed before rich art assets exist

Output:

- step document
- approved token and feedback mockup

### Step 5 - Motion and Scene Interaction Plan

Focus:

- define token movement animation baseline
- define camera restraint and optional subtle motion
- define hover, focus, and prompt coordination between DOM and scene

Output:

- step document
- approved motion mockup

### Step 6 - Responsive and Performance Baseline Plan

Focus:

- define mobile composition and degraded scene mode if needed
- define asset, light, and effect budget for the first scene pass
- define guardrails to avoid turning the match screen into a heavy render surface too early

Output:

- step document
- approved responsive/perf mockup

### Step 7 - Phase 12 Sign-Off

Focus:

- confirm the board scene is integrated, readable, and aligned with the app shell
- confirm the project is ready for richer scene polish in later phases

Output:

- sign-off document

## Working Principles for Phase 12

- the board scene is a presentation layer, not a gameplay authority
- the scene should make the world clearer within a few seconds of loading
- the middle of the board should feel like a tabletop stage, not a dashboard panel
- HUD surfaces should stay compact and edge-bound while the scene does most of the visual communication
- placeholder geometry is acceptable if composition, readability, and state projection are already correct

## Current Phase Status

As of 2026-03-31:

- Phase 12 is in progress
- Step 1 is implemented and verified
- Step 2 is the next planning step and should follow the same approval-first workflow

## Expected Handoff After Phase 12

Once Phase 12 is complete, the project should be ready to continue with:

- richer post-match UX and transition polish in Phase 13
- additional board atmosphere, token identity, and interaction refinement
- later production hardening and deploy work without revisiting core scene architecture