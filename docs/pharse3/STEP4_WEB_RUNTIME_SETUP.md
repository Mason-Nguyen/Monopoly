# Phase 3 - Step 4: Web Runtime Setup

## Objective

Turn `apps/web` from a placeholder package into a real frontend runtime based on Vite and React.

This step establishes the actual browser entry point, Vite tooling, React rendering setup, and a minimal application shell that proves the frontend package is ready for later feature work.

## Implemented Scope

The web runtime setup includes:

- real Vite dev and build scripts
- React and React DOM dependencies
- Vite React plugin setup
- browser entry HTML file
- React application entry point
- initial `App` component
- initial stylesheet and responsive app shell

## Files Added or Updated

Within `apps/web`:

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/app/app.css`
- `src/app/index.ts`

## Key Decisions Reflected in Code

- Vite is used as the frontend runtime and build tool
- React is mounted through `react-dom/client`
- the app shell already consumes shared board config and constants
- the initial screen is intentionally simple but buildable and responsive
- shared workspace packages remain the source for game constants and board definitions

## Notes

- Dependencies have been declared but not installed yet in this step.
- Build verification is still planned for Phase 3 Step 7.
- Router, query/state libraries, and 2.5D rendering libraries are not added in this step yet.

## Exit Criteria

Step 4 is complete when:

- `apps/web` has real runtime scripts
- the frontend has a valid Vite entry flow
- the package is structurally ready for `npm install` and later build verification
- later feature work can start from a real React app instead of placeholders