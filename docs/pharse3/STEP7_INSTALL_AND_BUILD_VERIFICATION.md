# Phase 3 - Step 7: Install and Build Verification

## Objective

Verify that the workspace can install dependencies, typecheck cleanly, and build successfully after the runtime and scaffolding work from Steps 1 through 6.

## Verification Results

The following commands completed successfully during Step 7:

- `npm install`
- `npm run typecheck`
- `npm run build`

## Key Fixes Applied During Step 7

### Workspace Package References

The npm environment in this workspace rejected the `workspace:*` dependency protocol during installation.

To make installation work reliably in the current environment, internal package references were changed from `workspace:*` to the explicit local workspace version `0.0.0`.

### Shared Package Build Setup

The shared packages were upgraded from placeholder build scripts to real TypeScript builds:

- `@monopoly/shared-types`
- `@monopoly/shared-config`
- `@monopoly/game-engine`

These packages now expose real `main`, `module`, `types`, and `exports` entries that point to actual build outputs.

### TypeScript Workspace Compatibility

The workspace TypeScript configuration was adjusted so app packages can typecheck cleanly while consuming the shared packages.

This included:

- removing overly restrictive `rootDir` assumptions from app-level compilation
- using bundler-style module resolution where appropriate for workspace builds
- normalizing `.js` suffixes in shared package internal exports/imports
- fixing React JSX typing in the web app
- fixing Colyseus room typing issues and override annotations in the game server

### Root Build Ordering

The root build command was changed to an explicit dependency-aware order:

1. `@monopoly/shared-types`
2. `@monopoly/shared-config`
3. `@monopoly/game-engine`
4. `@monopoly/api`
5. `@monopoly/game-server`
6. `@monopoly/web`

This prevents app builds from running before their internal package dependencies have produced build outputs.

## Final Status

Step 7 is complete.

The workspace now satisfies the core Phase 3 verification goals:

- dependencies install successfully
- TypeScript checks pass across all workspaces
- the full workspace build completes successfully

## Notes

- `npm install` reported `6` low severity vulnerabilities.
- No vulnerability remediation was applied during this step.
- Runtime smoke-testing of `dev` or `start` commands was not performed in this step.

## Exit Criteria Check

- successful workspace install: passed
- successful workspace typecheck: passed
- successful workspace build: passed
- blocking config issues resolved: passed