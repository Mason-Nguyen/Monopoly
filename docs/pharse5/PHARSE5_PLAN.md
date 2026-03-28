# Phase 5 - Backend API

## Purpose

Phase 5 turns the persistence foundation from Phase 4 into a usable application-facing API layer.

This phase focuses on backend endpoints and service flows that sit outside the active Colyseus game room runtime.

## Phase 5 Goal

Create a clean and implementation-ready API baseline for:

- profile reads
- leaderboard reads
- match history reads
- future authentication and guest entry flows
- consistent request validation and error handling
- route and service boundaries that stay decoupled from Colyseus room logic

## Inputs from Previous Phases

Phase 5 must respect the approved outcomes from earlier phases, including:

- MVP and match rules from Phase 1
- domain, command, event, and state design from Phase 2
- runnable workspace and runtime foundations from Phase 3
- verified PostgreSQL, Prisma, migrations, seed data, and repository/service boundaries from Phase 4

## Required End State for Phase 5

By the end of Phase 5:

- the API app should expose the first real non-health endpoints
- read flows for seeded persistence data should be reachable through Fastify routes
- request validation and response shaping should be consistent
- error handling should have a reusable baseline
- the workspace should remain typecheck- and build-clean
- the project should be ready for Phase 6 and later integration with game results and Colyseus-driven persistence flows

## Phase 5 Deliverables

By the end of Phase 5, the project should have:

- API scope and route-boundary documentation
- request and response contract notes for the first public endpoints
- profile read endpoints
- leaderboard read endpoints
- match history read endpoints
- API validation and error-handling baseline
- verification notes and Phase 5 sign-off

## Recommended Step Order

### Step 1 - API Scope and Route Boundaries

Focus:

- define which API features belong in Phase 5
- separate persistence-backed app API concerns from Colyseus room concerns
- identify which planned endpoints are implementable now and which should wait

Output:

- Phase 5 scope document
- route ownership and dependency notes

### Step 2 - Shared API Contracts and Error Model

Focus:

- define baseline request and response shapes
- define error response format and status-code conventions
- define reusable validation approach for query params and route params

Output:

- API contract document
- common response and error utilities scaffold

### Step 3 - Profile Read Endpoints

Focus:

- expose seeded player profile reads through Fastify routes
- connect route handlers to existing profile services

Output:

- profile route handlers
- service wiring for profile reads

### Step 4 - Leaderboard Read Endpoints

Focus:

- expose leaderboard reads through Fastify routes
- support pagination-ready query patterns

Output:

- leaderboard route handlers
- leaderboard response shaping

### Step 5 - Match History Read Endpoints

Focus:

- expose match history reads through Fastify routes
- support match list and match detail flows

Output:

- match history route handlers
- match detail response shaping

### Step 6 - Validation and Error Handling Integration

Focus:

- apply consistent validation for route params and query strings
- add reusable error handling and API-safe failure responses

Output:

- validation helpers or schemas
- Fastify error-handling baseline

### Step 7 - Verification and Sign-Off

Focus:

- verify the new API routes against the local seeded PostgreSQL database
- confirm response behavior and workspace health

Output:

- verification notes
- Phase 5 sign-off document

## Working Principles for Phase 5

- keep the API app focused on application-facing HTTP flows, not active room state
- keep Colyseus as the owner of live match state and room lifecycle
- prefer read-first HTTP endpoints on top of already verified seed and persistence data
- avoid introducing fake room-listing APIs before the room lifecycle integration is ready
- keep request validation close to the route boundary and business reads in services
- preserve the repository and service separation introduced in Phase 4

## Planned In-Scope API Areas

The first implementation wave of Phase 5 should focus on:

- profile reads
- leaderboard reads
- match history reads
- shared API error and validation baseline

## Explicitly Deferred or Limited Areas

The following areas are not the primary target of the first Phase 5 implementation wave:

- real authentication flows with secure password handling
- live room listing backed by active Colyseus room state
- in-match gameplay HTTP APIs
- match result writes triggered from real completed games

These remain dependent on later gameplay and Colyseus integration phases.

## Expected Handoff After Phase 5

Once Phase 5 is complete, the project should be ready to continue with:

- gameplay engine implementation and Colyseus integration on top of a usable API layer
- future auth and guest-entry flows on top of stable route patterns
- frontend integration with real profile, leaderboard, and match-history endpoints