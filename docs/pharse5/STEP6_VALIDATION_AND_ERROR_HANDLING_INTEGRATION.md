# Phase 5 - Step 6: Validation and Error Handling Integration

## Objective

Apply the shared validation and error-handling baseline consistently across the real Phase 5 feature routes.

This step turns the Step 2 error and validation foundation into an integrated route-development pattern that future API modules can reuse directly.

## Implemented Scope

The Step 6 implementation includes:

- request-aware helpers for parsing params, query strings, and request bodies
- request-aware helpers for building response metadata
- a reusable `assertFound()` helper for standard `404 NOT_FOUND` flows
- route refactors across health, profiles, leaderboard, and match-history modules to use the shared helpers
- verification of invalid-input and not-found behaviors against the live API runtime

## Files Added or Updated

### `apps/api`

- `src/common/api/routes.ts`
- `src/common/api/index.ts`
- `src/modules/health/health.routes.ts`
- `src/modules/profiles/profiles.routes.ts`
- `src/modules/leaderboard/leaderboard.routes.ts`
- `src/modules/matches/matches.routes.ts`

### `docs/pharse5`

- `STEP6_VALIDATION_AND_ERROR_HANDLING_INTEGRATION.md`

## Shared Integration Helpers Added

The API now has route-focused helper utilities for:

- `parseRequestParams()`
- `parseRequestQuery()`
- `parseRequestBody()`
- `createRequestMeta()`
- `createPaginationMeta()`
- `assertFound()`

These helpers reduce duplication and make route modules read more like HTTP use-case definitions instead of low-level plumbing.

## Integration Outcome

The current route modules now follow a more consistent pattern:

1. parse params or query input through shared request-aware helpers
2. call the relevant service
3. use `assertFound()` when a durable entity must exist
4. return the shared success envelope with request metadata helpers

This keeps validation, metadata, and not-found responses aligned across all current routes.

## Verified Behaviors

Step 6 verification focuses on the most important contract-level behaviors:

- invalid UUID path parameters return `400 VALIDATION_ERROR`
- invalid pagination query values return `400 VALIDATION_ERROR`
- missing durable resources return `404 NOT_FOUND`
- unknown routes still return the shared route-not-found error envelope

## Notes

- Step 6 does not add new endpoint families; it strengthens the consistency of the existing Phase 5 routes
- the request-aware helpers are intentionally lightweight and avoid hiding route behavior behind heavy abstractions
- this step makes later route additions in Phase 5 and beyond significantly easier to implement consistently

## Exit Criteria

Step 6 is complete when:

- current routes use the shared validation and error-handling path consistently
- route modules no longer duplicate the most common request parsing and not-found patterns
- invalid-input and not-found behavior is verified against the API runtime
- the workspace remains typecheck- and build-clean after the integration refinements