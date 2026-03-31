# Phase 11 - Step 6: In-Match HUD and Event-Feed Implementation

## Planning Basis

This step continues the Game Studio-guided frontend implementation, mainly using:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

That means the Phase 11 match shell should:

- protect the future board playfield instead of letting DOM UI spread everywhere
- keep action controls compact and obvious
- surface event-driven information in a readable rail rather than a noisy overlay storm
- keep local UI concerns separate from future authoritative Colyseus room state

## Objective

Turn the current `/match/:matchId` route from a simple playfield reserve into a functional HUD shell with turn summary, action cluster, economy snapshot, player roster, connection messaging, and event feed.

## Scope Implemented In This Step

This step implements real code for:

- a `match shell preview query` layer that models HUD and event-feed data without pushing preview logic into the router
- a dedicated `matchUiStore` for UI-only panel and feed state
- an upgraded match shell layout with:
  - turn summary
  - action buttons
  - compact roster
  - connection banner
  - event feed with filter controls
- an upgraded central match stage with:
  - economy cards
  - board window preview
  - active panel state visibility
  - route handoff toward the result screen

## Architecture Decision For Step 6

Until live `MonopolyRoom` transport is wired into the frontend, the match shell should consume a dedicated preview data source through React Query.

This keeps the structure aligned with Step 3:

- preview data lives in a service/query layer
- local interaction state lives in a small UI store
- router and page components stay focused on presentation and interaction flow

Later, the preview query can be replaced by a Colyseus-backed room client without changing the shell structure.

## UI Decisions Locked In This Step

### Left Rail

The left rail should carry:

- turn number and phase summary
- the active player snapshot
- compact roster
- the primary action cluster

### Right Rail

The right rail should carry:

- connection-state banner
- event feed filter controls
- recent gameplay feed entries

### Center Stage

The center stage should keep focus on:

- playfield reserve messaging
- economy snapshot for the local player
- board-window context around the current tile
- handoff links for result flow

## Local UI State Decisions

The new `matchUiStore` is intentionally limited to:

- selected panel
- feed filter
- pending command indicator

It does not own canonical gameplay state.

That remains important for later Colyseus integration.

## Implementation Notes

The Step 6 service and store layer lives in:

- `apps/web/src/services/match-shell-preview-queries.ts`
- `apps/web/src/stores/match-ui-store.ts`

The main UI implementation lives in:

- `apps/web/src/app/router.tsx`
- `apps/web/src/pages/match-room-page.tsx`
- `apps/web/src/app/app.css`

## Remaining Work After Step 6

Step 6 does not yet wire authoritative room transport.

That remains a later implementation slice before Phase 11 can be signed off.

What Step 6 does accomplish is:

- a stable DOM-first HUD layout
- action and feed hierarchy that fits the future board renderer
- a local UI-state pattern ready for real room data
- clear separation between match chrome and center playfield reserve

## Expected Next Step

The next step is:

- `Phase 11 - Step 7: Phase 11 Sign-Off` once live room wiring and final functional gaps are settled