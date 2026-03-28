# Phase 3 - Step 1: Project Structure and Package Boundaries

## Objective

Define the initial workspace structure and package boundaries for the project before scaffolding code.

This step ensures that `web`, `api`, `game-server`, and shared packages each have a clear responsibility from the start.

## Design Principles

- Structure should mirror the approved architecture
- Shared code should be extracted only when it is genuinely cross-app
- Room logic should stay separate from API concerns
- Frontend code should stay separate from game server code
- Static config should have a clear home

## Recommended Top-Level Workspace Structure

Recommended structure:

```text
apps/
  web/
  api/
  game-server/
packages/
  shared-types/
  shared-config/
  game-engine/
docs/
  pharse1/
  pharse2/
  pharse3/
```

## Why This Structure

### `apps/web`

Purpose:

- React frontend application

Responsibilities:

- lobby UI
- game HUD
- board rendering
- room connection lifecycle in the browser
- event listeners and client-side state mapping

Should not own:

- authoritative game rules
- database logic
- websocket server logic

### `apps/api`

Purpose:

- backend API for app-facing and persistent concerns

Responsibilities:

- auth and player identity flow later
- profile APIs
- room listing APIs if needed
- match history
- leaderboard APIs
- PostgreSQL integration

Should not own:

- authoritative turn resolution
- Colyseus room state
- board animation logic

### `apps/game-server`

Purpose:

- Colyseus server and authoritative multiplayer game runtime

Responsibilities:

- `LobbyRoom`
- `MonopolyRoom`
- room command handling
- room validation
- synchronized room state
- reconnect and timeout behavior
- interaction with the game engine package

Should not own:

- browser UI
- broad REST API concerns
- unrelated persistence presentation logic

## Recommended Shared Packages

### `packages/shared-types`

Purpose:

- define cross-app contracts used by more than one app

Recommended contents:

- enums
- IDs and common type aliases
- command payload types
- event payload types
- board config interfaces
- API-facing DTO types that are shared

Should not contain:

- Colyseus schema classes
- React components
- NestJS or Express specific code
- Prisma models

### `packages/shared-config`

Purpose:

- store static product configuration shared across apps

Recommended contents:

- classic board config
- game constants
- optional environment-independent static lookup tables

Should not contain:

- runtime room state
- player ownership state
- API business logic

### `packages/game-engine`

Purpose:

- hold pure gameplay logic independent from transport and UI

Recommended contents:

- dice resolution helpers
- tile resolution logic
- payment resolution logic
- bankruptcy checks
- jail logic
- turn progression logic

Should not contain:

- Colyseus room code
- database code
- frontend rendering code

## Package Boundary Rules

### `web` can import from:

- `shared-types`
- `shared-config`

### `api` can import from:

- `shared-types`
- `shared-config` if needed

### `game-server` can import from:

- `shared-types`
- `shared-config`
- `game-engine`

### `game-engine` can import from:

- `shared-types`
- `shared-config`

### Avoid These Dependencies

- `web -> game-server`
- `web -> api` source imports
- `api -> game-server`
- `game-engine -> web`
- `game-engine -> api`

Reason:

- these directions create tight coupling and make testing harder

## Recommended Initial Folder Layout Per App

### `apps/web`

Suggested folders:

```text
src/
  app/
  pages/
  features/
  game/
  services/
  stores/
  hooks/
  lib/
```

High-level intent:

- `app/`: app bootstrap and providers
- `pages/`: route-level screens
- `features/`: lobby, room, profile, result flows
- `game/`: board scene, HUD, client game adapters
- `services/`: API and Colyseus client wrappers
- `stores/`: Zustand or client state containers
- `hooks/`: app-specific hooks
- `lib/`: small utilities

### `apps/api`

Suggested folders:

```text
src/
  modules/
  common/
  config/
  prisma/
```

High-level intent:

- `modules/`: feature modules such as auth, profile, match history
- `common/`: shared backend utilities and guards
- `config/`: environment and app config
- `prisma/`: database client and adapters

### `apps/game-server`

Suggested folders:

```text
src/
  rooms/
  schemas/
  handlers/
  services/
  config/
  lib/
```

High-level intent:

- `rooms/`: `LobbyRoom` and `MonopolyRoom`
- `schemas/`: Colyseus schema classes
- `handlers/`: command routing and room-specific action handlers
- `services/`: room orchestration and match setup helpers
- `config/`: server config
- `lib/`: small utilities and validation helpers

### `packages/shared-types`

Suggested folders:

```text
src/
  enums/
  ids/
  commands/
  events/
  board/
  common/
```

### `packages/shared-config`

Suggested folders:

```text
src/
  board/
  constants/
```

### `packages/game-engine`

Suggested folders:

```text
src/
  rules/
  reducers/
  resolvers/
  calculators/
  types/
```

Note:

- exact naming inside `game-engine` can evolve
- what matters now is transport independence and rule isolation

## Recommended Root-Level Files Later

Likely useful root files:

- `package.json`
- `tsconfig.base.json`
- `.gitignore`
- `.editorconfig`
- `.env.example`
- lint and format config files

If monorepo tooling is added later, it may also include:

- workspace config
- task runner config

## Recommended Ownership of Key Artifacts

### Board Config

Home:

- `packages/shared-config`

### Shared Enums and Payload Contracts

Home:

- `packages/shared-types`

### Colyseus Schema Classes

Home:

- `apps/game-server`

### REST DTO Adapters

Home:

- primarily `apps/api`, with shared payload interfaces in `packages/shared-types` when needed

### Game Rule Resolution

Home:

- `packages/game-engine`

## Recommended Scaffolding Order After Step 1

1. Create top-level `apps` and `packages` folders.
2. Create `web`, `api`, and `game-server` app folders.
3. Create `shared-types`, `shared-config`, and `game-engine` packages.
4. Add root TypeScript and workspace config.
5. Add placeholder source folders to each app and package.
6. Add README or placeholder files only if needed to keep structure explicit.

## Step 1 Deliverables

This step should produce:

- approved top-level workspace structure
- approved app responsibilities
- approved shared package boundaries
- approved dependency direction rules
- initial per-app and per-package folder suggestions

## Exit Criteria

Step 1 is complete when:

- each app has a clear responsibility
- shared code has a clear home
- dependency directions are explicit
- the team can scaffold folders without reopening architecture discussions
