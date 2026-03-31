# Phase 11 - Step 5: Lobby and Room UI Implementation

## Planning Basis

This step continues the Game Studio-guided frontend work, mainly using:

- `game-studio:game-ui-frontend`
- `game-studio:web-game-foundations`

That means the lobby and room surfaces should:

- move players into multiplayer flow quickly
- present ready-state and host-start gating clearly
- show reconnect-safe messaging without overwhelming the screen
- keep the pre-match room readable on both desktop and mobile

## Objective

Turn the Phase 11 lobby routes from simple placeholders into functional DOM-first multiplayer surfaces that already model the right information hierarchy before live Colyseus room wiring lands.

## Scope Implemented In This Step

This step implements real code for:

- a `lobby preview query` layer that keeps route components off of raw hardcoded arrays
- an upgraded `/lobbies` screen with room summaries, room-state indicators, and quick room-entry actions
- an upgraded `/lobbies/:lobbyId` screen with:
  - roster cards
  - ready-state toggling for the current local player
  - host-start gating rules
  - reconnect reservation messaging
  - session continuity writeback to the local session store

## Architecture Decision For Step 5

Until live Colyseus lobby connections are wired in a later step, the lobby routes should consume a dedicated frontend data layer rather than hardcoding preview data directly inside route components.

This keeps the structure aligned with Step 3:

- route components remain focused on presentation and interaction flow
- query/service files own the preview data source
- replacing preview data with real room transport later does not require a UI rewrite

## UI Decisions Locked In This Step

### `/lobbies`

The lobby list should show, at a glance:

- room title
- host identity
- seat count
- ready count
- reconnect reservation presence
- whether the local player is likely to act as host or guest in the preview

### `/lobbies/:lobbyId`

The room detail should show:

- current room identity
- local ready toggle
- whether the current player is host
- whether the host can start the match now
- why start is blocked when it is blocked
- whether any seat is currently reconnect-reserved
- the full room roster in a layout that can later map to live lobby state

## Host-Start Gating Rules Shown In The UI

The functional room shell now exposes the same core ideas the live lobby room will need:

- the room needs at least the MVP minimum number of players
- all seated players must be ready before start is enabled
- only the host should see an enabled start action
- reconnect-held seats should surface as a delay reason rather than disappearing silently

## Reconnect Messaging Direction

Reconnect messaging in the lobby room is intentionally explicit but compact.

The screen uses:

- a reconnect banner for reserved seats
- seat-level badges for reconnect-held players
- room-level summary messaging that explains why a start might still be delayed

This matches the Game Studio guidance of keeping browser-game multiplayer state visible without turning the screen into an admin dashboard.

## Implementation Notes

The new query layer lives in:

- `apps/web/src/services/lobby-preview-queries.ts`

The main Step 5 route implementation lives in:

- `apps/web/src/pages/lobbies-page.tsx`
- `apps/web/src/pages/lobby-room-page.tsx`

Styling support is added in:

- `apps/web/src/app/app.css`

## Remaining Work After Step 5

Step 5 does not yet wire the actual `LobbyRoom` Colyseus transport.

That remains for later frontend integration work.

What this step does accomplish is:

- stable information hierarchy
- reusable room summary patterns
- host-start and ready-state UX baseline
- reconnect-aware room messaging baseline

## Expected Next Step

The next step is:

- `Phase 11 - Step 6: In-Match HUD and Event-Feed Plan`