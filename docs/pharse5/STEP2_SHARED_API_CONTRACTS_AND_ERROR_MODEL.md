# Phase 5 - Step 2: Shared API Contracts and Error Model

## Objective

Define and scaffold the shared HTTP API contracts, validation baseline, and error model for the backend API.

This step gives all Phase 5 routes a consistent response shape and a reusable failure-handling path before feature-specific endpoints are added.

## Implemented Scope

The Step 2 implementation includes:

- shared success and error response envelopes
- standardized API error codes
- a reusable application error class
- Fastify not-found and error handling registration
- Zod-based validation helpers for route params, query strings, and request payloads
- a reusable pagination query schema factory
- alignment of the existing health routes with the new response envelope

## Files Added or Updated

### `apps/api`

- `package.json`
- `src/app.ts`
- `src/common/index.ts`
- `src/common/api/contracts.ts`
- `src/common/api/errors.ts`
- `src/common/api/validation.ts`
- `src/common/api/index.ts`
- `src/modules/health/health.routes.ts`

### `docs/pharse5`

- `STEP2_SHARED_API_CONTRACTS_AND_ERROR_MODEL.md`

## Shared Response Model

The API now has a common envelope for successful responses:

- `success: true`
- `data`
- optional `meta`

The API also has a common envelope for failed responses:

- `success: false`
- `error.code`
- `error.message`
- optional `error.details`

This makes route behavior predictable for the frontend and avoids route-by-route response drift.

## Error Model Adopted

The API baseline now uses these main error-code categories:

- `BAD_REQUEST`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`

A reusable `AppError` class carries:

- HTTP status code
- API error code
- public error message
- optional structured details

Fastify now maps:

- `AppError` instances to controlled API-safe error responses
- `ZodError` instances to `400 VALIDATION_ERROR`
- unknown failures to `500 INTERNAL_SERVER_ERROR`
- missing routes to `404 NOT_FOUND`

## Validation Model Adopted

The validation baseline now uses `zod` in the API app.

The shared validation utilities provide:

- `parseWithSchema()` for route-boundary parsing
- `createPaginationQuerySchema()` for consistent paginated reads
- `z` re-export for later route modules

This keeps validation close to route boundaries while allowing services and repositories to stay focused on business and persistence concerns.

## Runtime Integration

The shared API error handling is now registered at app creation time in `createApiApp()`.

The existing health routes were updated to return the shared success envelope so the project now has a live route already using the new contract baseline.

## Notes

- this step introduces the response and validation baseline before feature routes are added
- the error model is intentionally small and can expand later when auth, conflict flows, or domain-specific not-found cases become richer
- the route modules in later steps should use these shared utilities instead of inventing local response or error shapes

## Exit Criteria

Step 2 is complete when:

- the API has a documented response envelope
- the API has a documented error model
- reusable validation helpers exist
- Fastify has a shared error-handling baseline
- the workspace remains typecheck- and build-clean after the new shared API layer is added