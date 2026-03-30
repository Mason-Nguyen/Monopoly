# Phase 9 - Step 2: Match Result Snapshot and Mapping Design

## Objective

Define the persistence snapshot shape that Phase 9 will build from a finished `MonopolyRoom`, and map that snapshot into PostgreSQL writes for:

- `matches`
- `match_players`
- `leaderboard_stats`

This step exists to make the later implementation deterministic before any Prisma write code is added to `apps/game-server`.

## Core Design Decision

Phase 9 should persist from a dedicated completed-match snapshot instead of writing directly from raw room state inside repository code.

Reason:

- room state uses Colyseus-friendly sentinel values such as `""`, `0`, and `-1`
- database writes need durable nullable fields, enum-safe values, and finalized ranking semantics
- some persistence data is easier to derive once in a dedicated mapping layer than repeatedly inside database calls

Approved direction:

- `MonopolyRoom` produces or delegates creation of a `CompletedMatchPersistenceSnapshot`
- repository code writes only from this snapshot, not from raw room schema objects

## Snapshot Source of Truth

The completed snapshot should be built from two inputs:

1. authoritative finished room state
2. lightweight room-local persistence runtime metadata collected during the match

### Authoritative Finished Room State

Primary source for:

- match identity
- board identity
- started/finished timestamps
- final balances
- final positions
- winner
- terminal end reason
- final player flags such as `isBankrupt` and `isAbandoned`

### Room-Local Persistence Runtime Metadata

Needed for fields that are not preserved precisely in the current synchronized room schema, especially:

- elimination order
- elimination timestamps

This metadata should stay runtime-only and should not become synchronized Colyseus schema state.

## Required Snapshot Shape

Approved first-wave snapshot contract:

```ts
interface CompletedMatchPersistenceSnapshot {
  match: PersistedMatchSnapshot;
  players: PersistedMatchPlayerSnapshot[];
  leaderboardDeltas: PersistedLeaderboardDelta[];
}

interface PersistedMatchSnapshot {
  matchId: string;
  sourceLobbyId: string | null;
  boardConfigKey: string;
  status: "finished";
  startedAt: number;
  finishedAt: number;
  endReason:
    | "last_player_remaining"
    | "all_others_bankrupt"
    | "all_others_abandoned"
    | "manual_termination_dev_only";
  winnerUserId: string | null;
  playerCount: number;
}

interface PersistedMatchPlayerSnapshot {
  matchId: string;
  userId: string;
  displayNameSnapshot: string;
  turnOrder: number;
  startBalance: number;
  finalBalance: number;
  finalPosition: number;
  finalRank: number;
  isBankrupt: boolean;
  isAbandoned: boolean;
  eliminationReason: "bankrupt" | "abandoned" | null;
  eliminatedAt: number | null;
}

interface PersistedLeaderboardDelta {
  userId: string;
  matchesPlayedDelta: number;
  winsDelta: number;
  lossesDelta: number;
  bankruptciesDelta: number;
  abandonsDelta: number;
  lastMatchAt: number;
}
```

This is a design contract for Phase 9 implementation. It does not need to be exposed to clients.

## Match-Level Mapping Rules

### `matches.id`

Map from:

- `room.state.matchId`

Rule:

- reuse the live `matchId` exactly
- do not generate a second persistence-specific match identifier

### `matches.source_lobby_id`

Map from:

- `room.state.sourceLobbyId`

Rule:

- if the room uses `""` sentinel, persist `null`
- otherwise persist the string value directly

### `matches.board_config_key`

Map from:

- `room.state.board.boardId`

Rule:

- this is the durable key that ties the persisted match to the board configuration used at runtime

### `matches.status`

Rule:

- always persist `finished`
- Phase 9 does not persist still-playing matches

### `matches.started_at`

Map from:

- `room.state.startedAt`

### `matches.finished_at`

Preferred source:

- `room.state.result.finishedAt`

Fallback source:

- `room.state.finishedAt`

Rule:

- a completed snapshot is invalid if no finished timestamp can be resolved

### `matches.end_reason`

Preferred source:

- `room.state.result.endReason`

Mapping:

- `last_player_remaining` -> `last_player_remaining`
- `all_others_bankrupt` -> `all_others_bankrupt`
- `all_others_abandoned` -> `all_others_abandoned`
- `manual_termination_dev_only` -> `manual_termination_dev_only`

Rule:

- the current engine and Prisma enum names already align `1:1`
- no translation table is needed beyond validation

### `matches.winner_user_id`

Preferred source:

- `room.state.result.winnerPlayerId`

Rule:

- persist `null` only if the finalized room truly has no winner
- for normal MVP completed matches, a winner should exist

### `matches.player_count`

Map from:

- `room.state.players.size`

## Player-Level Mapping Rules

Each persisted player row must be derived from the finalized room player state plus elimination metadata when available.

### `match_players.match_id`

Map from:

- snapshot `matchId`

### `match_players.user_id`

Map from:

- `player.playerId`

Rule:

- this assumes the playerId is already the durable `users.id` approved in Step 1

### `match_players.display_name_snapshot`

Map from:

- `player.displayName`

Rule:

- persist the room's final display-name snapshot directly
- do not re-read profiles during persistence

### `match_players.turn_order`

Map from:

- `player.turnOrder`

### `match_players.start_balance`

Source:

- board configuration used by the room

Approved rule:

- derive from board-config `startingMoney`, not from a hard-coded constant in repository code
- for the current board, this resolves to the classic configuration starting money

### `match_players.final_balance`

Map from:

- `player.balance`

### `match_players.final_position`

Map from:

- `player.position`

### `match_players.is_bankrupt`

Map from:

- `player.isBankrupt`

### `match_players.is_abandoned`

Map from:

- `player.isAbandoned`

### `match_players.elimination_reason`

Rule:

- if `player.isBankrupt === true`, persist `bankrupt`
- else if `player.isAbandoned === true`, persist `abandoned`
- else persist `null`

This aligns directly with the existing Prisma enum.

### `match_players.eliminated_at`

Preferred source:

- room-local elimination timeline metadata captured when elimination happens

Fallback rule for MVP safety:

- if the player is eliminated but no elimination timestamp was captured, fallback to `match.finishedAt`
- if the player is not eliminated, persist `null`

Reason:

- the current synchronized room schema does not preserve per-player elimination timestamps
- a runtime-only elimination timeline gives later steps a precise source without polluting synchronized state

## Final Rank Derivation

`match_players.final_rank` must be deterministic and should represent actual survival order.

Approved ranking model:

- winner gets `finalRank = 1`
- eliminated players are ranked by elimination order
- earliest eliminated player receives the worst rank
- latest eliminated player receives the best non-winner rank

Example for a 4-player match:

- first eliminated -> rank `4`
- second eliminated -> rank `3`
- third eliminated -> rank `2`
- winner -> rank `1`

## Required Runtime Metadata for Ranking

To support correct ranking, the room should maintain a runtime-only elimination timeline like:

```ts
interface MatchEliminationRecord {
  playerId: string;
  reason: "bankrupt" | "abandoned";
  eliminatedAt: number;
  sequence: number;
}
```

Approved use:

- append one record when a player is authoritatively eliminated
- derive `finalRank` from elimination sequence at final persistence time
- do not synchronize this timeline to clients via Colyseus schema

## Leaderboard Delta Mapping Rules

Leaderboard updates should be derived from the completed persisted snapshot, not directly from the live room state during repository writes.

### Base Rules

For every persisted player:

- `matchesPlayedDelta = 1`
- `lastMatchAt = match.finishedAt`

### Winner

For the winner:

- `winsDelta = 1`
- `lossesDelta = 0`
- `bankruptciesDelta = 0`
- `abandonsDelta = 0`

### Non-Winners

For every non-winner:

- `winsDelta = 0`
- `lossesDelta = 1`

Additional elimination-based deltas:

- if `eliminationReason = bankrupt` -> `bankruptciesDelta = 1`
- if `eliminationReason = abandoned` -> `abandonsDelta = 1`
- otherwise both remain `0`

## Validation Rules for Snapshot Creation

A completed match snapshot should be rejected before any database write if any of the following is true:

- room status is not `finished`
- `matchId` is empty
- `boardId` is empty
- `finishedAt` cannot be resolved
- `playerCount < 2`
- winner does not exist in the player map when a winner is required
- a player row cannot map to a valid durable `userId`
- duplicate turn order exists in the room player set
- final rank derivation would produce duplicates or gaps

## Mapping Gaps Explicitly Accepted for MVP

The following limitations are acceptable in the first implementation wave:

- no persistence of per-turn economic transactions into `transactions`
- no durable replay log for reconstructing the full match timeline
- elimination timestamps may fallback to `finishedAt` if runtime metadata is missing

These tradeoffs are acceptable because Phase 9 is focused on durable completed match history, not full event sourcing.

## Expected Result After Step 2

After this step:

- the project has an approved completed-match snapshot shape
- the mapping from room/runtime state into Prisma rows is explicit
- later implementation can add repositories and finalize writes without re-deciding persistence semantics
