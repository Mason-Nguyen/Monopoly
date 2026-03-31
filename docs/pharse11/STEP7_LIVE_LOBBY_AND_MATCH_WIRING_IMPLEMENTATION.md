# Phase 11 - Step 7: Live Lobby and Match Wiring Implementation

## Objective

Connect the frontend room routes to real Colyseus rooms so the Phase 11 DOM shell no longer depends only on static preview data.

This step keeps the preview layer as a safe fallback, but it now prefers live room state whenever the requested room is available.

## What Was Implemented

### 1. Live Lobby Bootstrap From the Lobby List

The lobby list can now create a real `LobbyRoom` through the Colyseus client and navigate directly into the dedicated lobby route.

That flow is implemented in:

- `apps/web/src/pages/lobbies-page.tsx`
- `apps/web/src/services/live-room-registry.ts`

A lightweight room registry is used so the room created on the discovery page can be reused by the lobby route without forcing an immediate disconnect/reconnect race.

### 2. Live Lobby Route Wiring

The lobby room route now attempts a real `joinById()` flow before falling back to preview data.

That flow is implemented in:

- `apps/web/src/hooks/use-live-lobby-room.ts`
- `apps/web/src/pages/lobby-room-page.tsx`
- `apps/web/src/services/live-room-projections.ts`

When the live room is available, the route reads real lobby state, sends real ready-state commands, and waits for the authoritative `lobby:matchStarting` event.

If the room does not exist, the page still renders the preview shell instead of failing blank.

### 3. Real Lobby-to-Match Handoff Support

The game server now creates a real `MonopolyRoom` when the host sends `lobby:startMatch`.

That required two supporting changes:

- `packages/shared-types/src/events/lobby.ts`
- `apps/game-server/src/handlers/lobby.ts`

`lobby:matchStarting` now includes a `roomId`, not just a `matchId`. This allows the frontend to open the correct live match room instead of relying on preview-only handoff.

### 4. Live Match Room Provider

The match routes now sit behind a live match provider that:

- reconnects using stored reconnection metadata when possible
- joins the stored room id when the match route belongs to the current live session
- falls back to preview state if a live room is not available
- projects authoritative Colyseus room state into the existing Phase 11 HUD shell
- consumes `game:*` events to build the right-rail event feed

That logic is implemented in:

- `apps/web/src/features/match/live-match-room-context.tsx`
- `apps/web/src/services/live-room-projections.ts`
- `apps/web/src/app/router.tsx`
- `apps/web/src/pages/match-room-page.tsx`

### 5. Session Continuity Metadata

The local session store now persists additional live-match metadata so the client can restore the active room path more reliably.

Files:

- `apps/web/src/services/session-service.ts`
- `apps/web/src/stores/session-store.ts`

The store now keeps:

- `lastMatchRoomId`
- `lastMatchReconnectToken`

## Key UX Result

Phase 11 now has a real vertical slice for room flow:

- create live lobby
- open live lobby route
- toggle ready state with real room messages
- host start creates a real monopoly room on the server
- route handoff moves into a live match shell
- live room state and `game:*` events drive the HUD when the room is available
- preview data still protects the route when no live room exists

## Files Added or Updated

### Frontend

- `apps/web/src/services/session-service.ts`
- `apps/web/src/stores/session-store.ts`
- `apps/web/src/services/live-room-registry.ts`
- `apps/web/src/services/live-room-projections.ts`
- `apps/web/src/hooks/use-live-lobby-room.ts`
- `apps/web/src/features/match/live-match-room-context.tsx`
- `apps/web/src/pages/lobbies-page.tsx`
- `apps/web/src/pages/lobby-room-page.tsx`
- `apps/web/src/pages/match-room-page.tsx`
- `apps/web/src/app/router.tsx`

### Shared / Server Support

- `packages/shared-types/src/events/lobby.ts`
- `apps/game-server/src/handlers/lobby.ts`

## Verification

Verified successfully with:

- `npm run typecheck`
- `npm run build`
- `npm run test:integration --workspace @monopoly/game-server`

## Notes and Remaining Caveats

- The preview query layer is intentionally still present as a fallback. This keeps Phase 11 routes usable even if the game server is offline or the requested room id is not a live room.
- The Phase 11 DOM shell is now live-room aware, but the board itself is still a reserved placeholder surface until Phase 12.
- The web bundle warning is still present after this step. Current production build output reports a main JS chunk above `500 kB`, so route-based code splitting should be considered during later frontend polish.