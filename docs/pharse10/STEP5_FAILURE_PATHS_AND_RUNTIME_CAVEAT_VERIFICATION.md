# Phase 10 - Step 5: Failure Paths and Runtime Caveat Verification

## Objective

Verify the approved MVP behavior when completed-match persistence cannot run normally, and record the runtime caveats that still exist at the current architecture stage.

Step 4 already proved that the happy-path database writes work. Step 5 focuses on what happens when the write path is skipped, rejected, retried, or invoked concurrently.

## What This Step Adds

Step 5 adds:

- runtime-only persistence tests that do not depend on PostgreSQL writes
- explicit verification of persistence status markers on the room
- retry-safety checks for failed and concurrent persistence attempts
- a documented caveat list for the current room-to-database behavior

## Implemented Files

### Runtime Failure-Path Tests

- `apps/game-server/tests/completed-match-persistence.runtime.test.ts`

### Script Update

- `apps/game-server/package.json`

## Verified Failure and Degrade-Safe Paths

The new runtime suite verifies the following current behaviors.

### Non-Finished Room No-Op

Verified:

- `persistCompletedMonopolyRoomIfNeeded(...)` returns immediately if the room is not `finished`
- repository methods are not called
- persistence markers remain untouched

Current meaning:

- persistence is only part of the match-completion boundary, not a general write helper for active rooms

### Missing Database Configuration

Verified:

- when `DATABASE_URL` is missing, a finished room is marked `skipped_not_configured`
- repository methods are not called
- the flow degrades safely instead of throwing

Current meaning:

- local or test environments without a configured database do not break gameplay truth
- the room still records that durable persistence was skipped

### Repository Failure

Verified:

- repository write failures reject the direct persistence call
- the room is marked `failed`
- `completedMatchPersistenceError` stores the surfaced error message
- `completedMatchPersistencePromise` is cleared after failure

Current meaning:

- the failure is loud at the direct service boundary
- retry remains possible because the in-flight promise is not left hanging

### Retry After Failure

Verified:

- the same finished room can be retried after a failed persistence attempt
- a later successful repository call moves the room into `persisted`
- the previous failure message is cleared on the successful retry

Current meaning:

- temporary persistence failures do not permanently poison a completed room object

### Concurrent Persistence Calls

Verified:

- concurrent calls against the same finished room share one in-flight promise
- repository lookup and write only run once while the first attempt is still active
- final state becomes `persisted` after the shared promise resolves

Current meaning:

- duplicate finalize triggers within the same runtime window do not fan out into duplicate writes

## Current Runtime Caveats Confirmed in Step 5

The current architecture still has these caveats.

### Direct Service vs Room-Triggered Behavior

Current behavior:

- direct calls to `persistCompletedMonopolyRoomIfNeeded(...)` reject on repository failure
- `processMonopolyRoomTransition(...)` intentionally swallows that rejection after the room is marked `failed`

Why this exists:

- gameplay truth must not be rolled back just because durable persistence failed
- the room keeps failure markers for observability and later retry handling

### Persistence Configuration Is Environment-Driven

Current behavior:

- persistence availability is decided from `DATABASE_URL` at call time, not at module-load time

Why this matters:

- tests can switch between configured and unconfigured modes without reloading modules
- runtime behavior still depends on environment configuration being present in the host process

### Source-Level Test Runner Requirement

Current behavior:

- persistence tests continue to run through `node --import tsx --test`
- database-backed verification may still require execution outside the sandbox because `node --test` can hit `spawn EPERM`

Why this matters:

- the persistence verification path is automated, but still has environment-specific tooling caveats in this workspace

## Expected Result After Step 5

After this step:

- current failure-path behavior is documented and covered by repeatable tests
- room persistence status markers are verified beyond the happy path
- the project is ready for Step 6 verification summary and final coverage review for Phase 10