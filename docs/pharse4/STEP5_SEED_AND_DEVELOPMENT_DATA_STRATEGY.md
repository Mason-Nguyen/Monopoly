# Phase 4 - Step 5: Seed and Development Data Strategy

## Objective

Define the local development seed strategy for the PostgreSQL persistence layer and add a safe baseline seed path for the current MVP scope.

This step keeps local database bootstrapping simple without prematurely seeding gameplay history or moving board configuration into the database.

## Implemented Scope

The Step 5 implementation includes:

- Prisma seed command wiring through `prisma.config.ts`
- a dedicated `prisma:seed` script in `apps/api`
- a deterministic and idempotent seed baseline for development use
- an initial demo dataset for durable user-facing entities only
- clear documentation of what is intentionally not seeded yet

## Files Added or Updated

### `apps/api`

- `package.json`
- `prisma.config.ts`
- `src/prisma/seed.ts`

### `docs/pharse4`

- `STEP5_SEED_AND_DEVELOPMENT_DATA_STRATEGY.md`

## Seed Strategy Adopted

The project now uses a small, repeatable development seed that focuses only on durable baseline data that is useful before gameplay persistence is fully implemented.

The seed is intentionally scoped to:

- demo users
- demo profiles
- demo leaderboard stats

The seed intentionally does not create fake historical gameplay data.

## Seeded Data Baseline

The current baseline seed creates or updates six demo local users so the project always has a predictable set of player identities for local development.

For each demo user, the seed also creates or updates:

- one profile row
- one leaderboard stats row

This aligns well with the current MVP because it supports early API and UI work such as profile display, player selection, and leaderboard rendering without inventing fake match histories too early.

## Data Intentionally Not Seeded Yet

The following entities are intentionally left out of the Step 5 seed baseline:

- `matches`
- `match_players`
- `transactions`
- board tiles or property definitions
- room or live gameplay state

These are left out for now because:

- match history data is easier to trust once it comes from real runtime flows
- transaction history without real gameplay logic becomes noisy and misleading
- board configuration already lives in code-driven shared config
- live room state belongs to Colyseus memory, not the database

## Idempotency Strategy

The seed uses stable GUID v4 values and Prisma `upsert` calls for all demo entities.

That means local developers can rerun the seed safely without creating duplicate demo users or drifting profile and leaderboard rows across runs.

## Operational Notes

To use the Step 5 seed path:

1. configure `DATABASE_URL`
2. apply the baseline migration to the local PostgreSQL database
3. run the Prisma seed command

Recommended command:

```bash
npm run prisma:seed --workspace @monopoly/api
```

## Notes

- the Step 5 seed path is meant for local development and onboarding, not production data loading
- the seeded password hashes are placeholders only and are not part of a real authentication flow yet
- guest users are intentionally not part of the first seed baseline because the durable seed is currently optimized for stable profile and leaderboard references

## Exit Criteria

Step 5 is complete when:

- the project has a documented seed strategy
- Prisma has a configured seed command
- a baseline seed script exists for development data
- the workspace remains typecheck- and build-clean after the seeding baseline is added