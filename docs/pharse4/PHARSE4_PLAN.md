# Phase 4 - PostgreSQL and Persistence Layer

## Purpose

Phase 4 defines and implements the first durable data layer for the project.

This phase turns the approved domain model and runtime foundation from earlier phases into a concrete PostgreSQL-backed persistence baseline that later API, game result storage, and statistics features can rely on.

## Phase 4 Goal

Create a clean and implementation-ready persistence foundation for:

- PostgreSQL-backed durable data
- Prisma schema and client setup
- relational storage for users, matches, and statistics
- repository and service boundaries for persistent entities
- migration and seed strategy for local development

## Inputs from Previous Phases

Phase 4 must respect the approved outcomes from earlier phases, including:

- MVP rules from Phase 1
- domain/state/event/command design from Phase 2
- workspace, runtime, and build-ready setup from Phase 3
- classic 40-tile board config already living in shared config
- Colyseus remaining the authoritative source for live in-match state

## Required End State for Phase 4

By the end of Phase 4:

- the project should have a clear persistence boundary between PostgreSQL and Colyseus memory state
- Prisma should be configured for PostgreSQL inside `apps/api`
- the initial relational schema should be defined
- initial migration files should exist
- a local seed path should exist for baseline development data when needed
- repository and service boundaries for persistent entities should be identified
- the workspace should remain buildable after persistence scaffolding is added

## Phase 4 Deliverables

By the end of Phase 4, the project should have:

- persistence architecture document
- PostgreSQL schema design
- Prisma setup in the API app
- initial Prisma schema
- initial migration baseline
- optional seed strategy or seed script baseline
- repository/service design notes for persistence-facing modules
- verification notes for migration and type generation

## Recommended Step Order

### Step 1 - Persistence Scope and Data Ownership

Focus:

- define what belongs in PostgreSQL
- define what remains only in Colyseus room memory
- define what should be persisted immediately, eventually, or not at all

Output:

- persistence scope document
- data ownership rules for runtime vs durable state

### Step 2 - Relational Schema Design

Focus:

- design tables and relationships for the initial MVP data model
- align persistent entities to approved match and player concepts

Output:

- relational schema design document
- initial entity list and relationship map

### Step 3 - Prisma Setup and API Integration Baseline

Focus:

- install and configure Prisma in `apps/api`
- define env usage for PostgreSQL connection
- establish the basic Prisma client integration path

Output:

- Prisma runtime setup
- generated client baseline

### Step 4 - Initial Prisma Schema and Migrations

Focus:

- implement the initial Prisma schema
- create the first migration baseline
- make sure the schema matches the approved relational design

Output:

- `schema.prisma`
- initial migration files

### Step 5 - Seed and Development Data Strategy

Focus:

- define what needs to be seeded for local development
- add seed scaffolding for the local persistence layer where useful

Output:

- seed strategy document
- optional seed script baseline

### Step 6 - Repository and Service Boundaries

Focus:

- define repository/service responsibilities for persistence-facing modules
- keep API modules and room logic decoupled from raw database access

Output:

- repository/service design document
- persistence boundary notes for later implementation

### Step 7 - Verification and Sign-Off

Focus:

- verify Prisma setup, schema generation, and migration baseline
- confirm Phase 4 outputs are ready for API and game result work

Output:

- verification notes
- Phase 4 sign-off document

## Working Principles for Phase 4

- keep Colyseus as the source of truth for live gameplay state
- persist durable business data, not per-frame or per-action room sync state
- keep schema design MVP-first and avoid premature feature expansion
- avoid leaking raw Prisma access across unrelated modules
- prefer clear relational design over flexible but ambiguous storage patterns
- keep board configuration in shared config unless a real product need appears for database-driven boards

## Expected Handoff After Phase 4

Once Phase 4 is complete, the project should be ready to begin:

- API feature implementation on top of a real PostgreSQL/Prisma baseline
- persistence of match results and player statistics
- leaderboard and match history data flows
- later authentication/profile data modeling without reopening persistence architecture