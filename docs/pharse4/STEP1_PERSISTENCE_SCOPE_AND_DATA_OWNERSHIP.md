# Phase 4 - Step 1: Persistence Scope and Data Ownership

## Objective

Define the persistence boundary before implementing PostgreSQL or Prisma details.

This step answers a critical architectural question: which data should live durably in PostgreSQL, and which data should remain only in Colyseus room memory during live gameplay.

## Why This Step Comes First

The project already has:

- MVP rules from Phase 1
- approved domain and room-state models from Phase 2
- real runtime scaffolding and build verification from Phase 3

Without a clear persistence boundary, it would be easy to over-persist live room state or couple the API and game server too tightly to database logic.

## Persistence Ownership Rule

The core rule for this project remains:

- `Colyseus` owns live gameplay state
- `PostgreSQL` owns durable business and history data

That means:

- turn-by-turn authoritative state lives in room memory and schema state
- persistent records such as users, match history, and stats live in PostgreSQL

## Data That Belongs In PostgreSQL

The following data should be persisted in the MVP persistence layer.

### User and Profile Data

Persist:

- `users`
- `profiles`
- stable player identity
- display metadata that should survive sessions

Reason:

These are durable account-level records and should not depend on active rooms.

### Match Metadata

Persist:

- `matches`
- source lobby reference when relevant
- started / finished timestamps
- match end reason
- winner reference

Reason:

This is historical data needed for match history, statistics, and later leaderboards.

### Match Player Records

Persist:

- `match_players`
- player participation per match
- final rank or elimination status
- final balance snapshot
- abandoned / bankrupt outcome where relevant

Reason:

This data supports history views, player stats, and later analytics.

### Economy and Transaction History

Persist in MVP if needed at a lightweight level:

- summary transaction records
- important economy events such as property purchase, rent payment, tax payment, bankruptcy trigger

Reason:

This is useful for auditability, match summaries, and debugging, but it should remain event-summary level rather than a full event-sourced engine unless the product needs that later.

### Leaderboard and Aggregate Statistics

Persist:

- player win/loss totals
- total matches played
- total bankruptcies or abandons if surfaced later

Reason:

These are durable aggregates and should be queryable without reconstructing room history.

## Data That Should Stay In Colyseus Memory Only

The following data should remain runtime-only during active gameplay.

### Live Turn State

Do not persist per action:

- current turn phase
n- dice values for the active unresolved turn
- temporary awaiting-input flags
- transient movement resolution state

Reason:

This state changes rapidly, is authoritative only inside the live room, and would create unnecessary persistence coupling.

### Active Connection and Socket Runtime

Do not persist as durable DB records:

- current socket/session object references
- live reconnect promises or timeout handles
- in-memory lifecycle flags used only by the current room process

Reason:

These are infrastructure/runtime concerns rather than business data.

### Full Live Board Ownership Snapshot On Every Action

Do not write on every step:

- every position change
- every ownership change as a standalone DB sync event during the match
- every balance mutation in real time

Reason:

This would create unnecessary database chatter and duplicate the purpose of Colyseus state synchronization.

Instead:

- keep the live authoritative state in Colyseus
- write final snapshots or important summaries at meaningful milestones such as match completion

## Data That May Be Persisted Later, But Not Required Immediately

The following data is optional or deferred beyond the earliest persistence baseline.

- detailed per-turn event logs for replay
- reconnect audit trails
- admin-only diagnostics history
- custom board definitions stored in the database
- rich analytics tables for balancing or telemetry

These should remain future-facing unless a real product need appears.

## Initial Persistent Entity Set for Phase 4

The recommended MVP-first entity set is:

- `users`
- `profiles`
- `matches`
- `match_players`
- `transactions`
- `leaderboard_stats`

Optional in early Phase 4, depending on how the API is shaped:

- `rooms` or `lobby_metadata`

## Recommended Persistence Timing

### Persist Immediately

Persist during or right after creation:

- user/profile creation
- match record creation when a match actually starts
- match player participation records

### Persist At Important Checkpoints

Persist at meaningful gameplay milestones:

- important summary transactions if the match summary needs them
- disconnect/abandon outcome when it becomes final
- match completion data

### Persist At Match End

Persist final durable output:

- winner
- end reason
- final balances
- player outcomes
- aggregate stats updates

## Ownership Boundary Per App

### `apps/game-server`

Owns:

- live room state
- rule execution
- command validation
- runtime transitions

Should not become:

- the main place for broad relational querying
- a generic reporting layer

### `apps/api`

Owns:

- PostgreSQL access
- Prisma client integration
- user/profile/history/leaderboard data access
- persistence-facing services and repositories

### `packages/shared-config`

Owns:

- static board configuration for the MVP

Should not move to PostgreSQL in Phase 4 unless there is a product requirement for runtime-editable boards.

## Step 1 Decisions

The following decisions are now locked for Phase 4:

- PostgreSQL stores durable game and account data
- Colyseus stores live in-match authoritative state
- Phase 4 will not attempt event sourcing for every gameplay mutation
- board configuration remains code-driven in shared config for now
- Prisma setup will live in `apps/api`
- match-level persistence should focus on summary/history correctness before analytics depth

## Exit Criteria

Step 1 is complete when:

- the durable vs runtime data boundary is explicit
- the MVP persistent entity set is identified
- the persistence ownership of `api`, `game-server`, and shared config is clear
- Step 2 can proceed into relational schema design without reopening boundary questions