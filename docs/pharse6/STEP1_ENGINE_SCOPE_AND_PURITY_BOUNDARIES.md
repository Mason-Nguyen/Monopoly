# Phase 6 - Step 1: Engine Scope and Purity Boundaries

## Objective

Define the exact scope of the pure game engine and lock the dependency boundaries that keep gameplay rules independent from transport, persistence, and rendering concerns.

## Why This Step Matters

The project now has:

- approved gameplay rules from Phase 1
- approved domain and board modeling from Phase 2
- a runnable workspace from Phase 3
- verified persistence and API foundations from Phases 4 and 5

Phase 6 must now turn those decisions into a reusable rule engine without letting Colyseus, Fastify, Prisma, or frontend concerns leak into the rule layer.

If the engine boundary is not kept strict now, Phase 7 room integration will become much harder to test and maintain.

## What Belongs Inside the Pure Engine

The pure engine in `packages/game-engine` should own deterministic gameplay rule execution such as:

- deciding what happens when a turn starts
- deciding movement from dice totals
- deciding when start salary is awarded
- deciding what a landed tile means
- deciding whether a property can be bought
- deciding rent and tax balance changes
- deciding jail and go-to-jail effects
- deciding bankruptcy and player elimination
- deciding which player becomes active next

## What Must Stay Outside the Pure Engine

The pure engine should not own or depend on:

- Colyseus room classes
- Fastify route handlers
- Prisma or PostgreSQL access
- React UI state
- WebSocket or HTTP request objects
- timers, reconnect slots, or session lifecycle handling
- logging side effects that are required for correctness

These remain responsibilities of `apps/game-server`, `apps/api`, or the frontend.

## Purity Model

The engine should behave like a deterministic transition system.

Meaning:

- input state + action + static config + optional injected randomness
- output new state + structured rule result

The engine should not silently pull data from globals or mutate external state.

## Recommended Engine Inputs

The engine should accept explicit inputs such as:

- current match state
- current turn state
- board config
- acting player ID
- requested action
- optional dice source or explicit dice values for deterministic testing

## Recommended Engine Outputs

The engine should return structured outputs such as:

- next match state
- turn outcome summary
- money transfers or tile effects
- whether the player may buy the current property
- whether the player was jailed, bankrupted, or eliminated
- whether the turn is complete

This output model will make it much easier for Colyseus rooms to map engine results into schema updates and client-facing events later.

## Dependency Rules

The engine may depend on:

- TypeScript standard language features
- shared config for board data
- shared types when those types are transport-agnostic and rule-safe

The engine should avoid depending on:

- API response types
- Prisma-generated types
- Colyseus schema classes
- Fastify or Node server runtime types

When a type is needed by both the engine and other layers, it should be represented as plain TypeScript data rather than framework-specific classes.

## Randomness Rule

Dice randomness must be injectable.

Reason:

- tests need deterministic control
- Colyseus integration may want to generate dice values outside the engine and pass them in explicitly
- the engine should not hide randomness inside `Math.random()` if that makes deterministic verification harder

## Mutation Rule

The engine may internally clone or immutably derive new state, but it should present a clear contract:

- either return new state objects
- or mutate only explicitly owned engine state objects inside a well-defined transition boundary

For this project, the safer baseline is to prefer explicit returned next-state objects or structured mutation results rather than implicit global mutation.

## Step 1 Decision Summary

The approved Phase 6 engine boundary is:

- pure gameplay rule logic belongs in `packages/game-engine`
- runtime orchestration belongs in `apps/game-server`
- persistence belongs in `apps/api` and PostgreSQL
- rendering and user interaction belong in `apps/web`

The engine must stay deterministic, transport-agnostic, and persistence-agnostic.

## Exit Criteria

Step 1 is complete when:

- the pure engine boundary is documented clearly
- in-scope and out-of-scope responsibilities are explicit
- dependency rules are defined
- the next step can safely design engine package contracts without scope ambiguity