# Phase 4 - Step 4: Initial Prisma Schema and Migrations

## Objective

Implement the initial Prisma schema for the MVP persistence layer and create the first migration baseline.

This step translates the approved relational design from Step 2 into concrete Prisma models, enums, and migration files that later API and match-result work can build on.

## Implemented Scope

The Step 4 implementation includes:

- initial Prisma enums aligned to the persistence design
- initial Prisma models for the MVP durable entity set
- snake_case table and column mapping through Prisma `@map` / `@@map`
- relation mapping for users, profiles, matches, match players, transactions, and leaderboard stats
- migration scripts baseline generated from the Prisma schema
- package scripts for Prisma migrate workflows in `apps/api`

## Files Added or Updated

### `apps/api`

- `package.json`
- `prisma/schema.prisma`
- `prisma/migrations/`

## Model Set Implemented

The initial Prisma schema now includes:

- `User`
- `Profile`
- `Match`
- `MatchPlayer`
- `Transaction`
- `LeaderboardStat`

The initial enum set includes:

- `UserAuthType`
- `MatchStatus`
- `MatchEndReason`
- `EliminationReason`
- `TransactionType`

## Key Decisions Reflected in Code

- `UUID`-based durable IDs are used for the main entities.
- Prisma model names stay domain-friendly while table and column names stay database-friendly through explicit mapping.
- live room state remains outside the relational schema.
- `board_config_key` stays a code-driven reference rather than a relational board table.
- transaction persistence remains summary-focused and uses `JSONB` only for lightweight extra metadata.
- leaderboard stats are stored as an aggregate table instead of calculated from scratch on every query.

## Migration Strategy Used In This Step

The initial migration baseline is generated from the schema itself rather than from a live development database dependency.

This keeps Step 4 implementable even when a PostgreSQL server is not currently running in the local environment.

## Notes

- Prisma does not express every PostgreSQL constraint ergonomically in the datamodel itself, so migration SQL may include additional database-level constraints where useful.
- database application of the migration to a real PostgreSQL instance is part of later verification once the actual database is available.
- seed work is intentionally deferred to Step 5.

## Exit Criteria

Step 4 is complete when:

- the initial Prisma datamodel exists
- the initial migration baseline exists
- the schema validates and generates successfully
- the workspace remains typecheck- and build-clean after persistence schema changes