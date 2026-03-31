# Phase 10 - Multiplayer Integration Tests and Persistence Verification

## Purpose

Phase 10 adds stronger automated verification on top of the multiplayer runtime and the new completed-match persistence flow.

Earlier phases already established:

- a pure gameplay engine with automated rule tests
- engine-backed Colyseus room integration
- reconnect, abandonment, leave, and idle-turn lifecycle behavior
- completed-match persistence into PostgreSQL with leaderboard updates

Phase 10 is where the project moves from smoke-verified multiplayer behavior into repeatable integration coverage.

## Phase 10 Goal

Create a reliable automated verification layer for room runtime, lifecycle behavior, and completed-match persistence so the project can keep moving into frontend implementation without multiplayer regressions becoming invisible.

## Inputs from Previous Phases

Phase 10 builds directly on:

- Phase 6 pure engine tests
- Phase 7 room integration and explicit gameplay events
- Phase 8 lifecycle hardening for reconnect, abandonment, and idle timeout
- Phase 9 durable match persistence and leaderboard updates

## Required End State for Phase 10

By the end of Phase 10:

- critical multiplayer flows have automated integration coverage
- persistence behavior is tested through repeatable harnesses instead of smoke scripts alone
- duplicate finalize and failure-path behavior are documented and verified at the current MVP level
- the project has a clear confidence baseline before frontend integration accelerates in later phases

## Phase 10 Deliverables

By the end of Phase 10, the project should have:

- integration-test scope and harness-boundary documentation
- a room-level integration test harness baseline
- automated tests for gameplay command and lifecycle flows
- automated tests for completed-match persistence and leaderboard updates
- failure-path and duplicate-finalize verification notes
- Phase 10 sign-off

## Recommended Step Order

### Step 1 - Integration Test Scope and Critical Path Coverage

Focus:

- define what Phase 10 must verify automatically
- separate engine-unit coverage from room-integration coverage
- define the minimum critical paths that must be covered before frontend-heavy work

Output:

- integration-test scope document
- approved critical-path list for multiplayer verification

### Step 2 - Room Test Harness and Runtime Boundaries

Focus:

- decide how tests instantiate and drive `MonopolyRoom`
- define what can be mocked and what should stay real
- establish the baseline harness utilities for room-driven tests

Output:

- room-test harness design
- reusable room-test support baseline

### Step 3 - Gameplay and Lifecycle Integration Tests

Focus:

- add automated tests for gameplay commands and room-driven lifecycle flows
- verify reconnect, abandonment, and idle behavior through repeatable tests
- assert state transitions and explicit event emissions together

Output:

- room integration tests for critical multiplayer flows

### Step 4 - Persistence Integration Tests

Focus:

- add automated tests for completed-match persistence into PostgreSQL
- verify `matches`, `match_players`, and `leaderboard_stats` together
- verify duplicate-finalize no-op behavior through test code instead of manual smoke only

Output:

- automated persistence integration coverage

### Step 5 - Failure Paths and Runtime Caveat Verification

Focus:

- verify approved MVP behavior when persistence fails or runtime preconditions are invalid
- document what should fail loudly versus what should degrade safely
- confirm current behavior for retry safety and persistence status markers

Output:

- failure-path verification notes
- updated runtime caveat list

### Step 6 - Verification Summary and Coverage Review

Focus:

- run the full verification set for the new integration layer
- summarize what is now covered automatically and what still depends on smoke/manual checks

Output:

- consolidated verification notes for Phase 10

### Step 7 - Sign-Off

Focus:

- confirm the project now has an approved multiplayer confidence baseline beyond engine-unit tests
- document the handoff into frontend-heavy phases

Output:

- Phase 10 sign-off document

## Working Principles for Phase 10

- keep engine-unit tests and room-integration tests clearly separated
- prefer deterministic test inputs and explicit assertions over broad end-to-end browser flows in this phase
- verify authoritative room behavior before investing in frontend polish
- persistence integration tests should validate durable outcomes, not re-implement gameplay rules
- smoke scripts can still help during debugging, but Phase 10 should convert critical behavior into repeatable automated tests

## Planned In-Scope Areas

The first implementation wave of Phase 10 should focus on:

- room integration tests driven from `apps/game-server`
- reconnect, abandonment, leave, and idle-turn behavior under automated tests
- completed-match persistence verification against PostgreSQL
- duplicate-finalize and persistence-status behavior
- event emission plus state-transition assertions for key room flows

## Explicitly Deferred or Limited Areas

The following areas are not the main target of Phase 10:

- browser-driven frontend tests
- landing page, lobby UI, room UI, or HUD implementation
- 2.5D board rendering and animation verification
- multi-instance Redis-backed coordination tests
- load testing or production-scale performance verification

## Expected Handoff After Phase 10

Once Phase 10 is complete, the project should be ready to continue with:

- functional frontend implementation on top of a better-tested multiplayer runtime
- frontend integration against authoritative room state and durable match history together
- post-match UX and result-screen flows built on a stronger persistence confidence baseline
