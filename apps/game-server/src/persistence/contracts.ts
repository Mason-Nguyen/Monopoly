import type {
  BoardId,
  EliminationReason,
  MatchEndReason,
  MatchId,
  PlayerId,
  UnixTimestampMs
} from "@monopoly/shared-types";

export interface PersistedMatchSnapshot {
  matchId: MatchId;
  sourceLobbyId: string | null;
  boardConfigKey: BoardId;
  status: "finished";
  startedAt: UnixTimestampMs;
  finishedAt: UnixTimestampMs;
  endReason: MatchEndReason;
  winnerUserId: PlayerId | null;
  playerCount: number;
}

export interface PersistedMatchPlayerSnapshot {
  matchId: MatchId;
  userId: PlayerId;
  displayNameSnapshot: string;
  turnOrder: number;
  startBalance: number;
  finalBalance: number;
  finalPosition: number;
  finalRank: number;
  isBankrupt: boolean;
  isAbandoned: boolean;
  eliminationReason: EliminationReason | null;
  eliminatedAt: UnixTimestampMs | null;
}

export interface PersistedLeaderboardDelta {
  userId: PlayerId;
  matchesPlayedDelta: number;
  winsDelta: number;
  lossesDelta: number;
  bankruptciesDelta: number;
  abandonsDelta: number;
  lastMatchAt: UnixTimestampMs;
}

export interface CompletedMatchPersistenceSnapshot {
  match: PersistedMatchSnapshot;
  players: PersistedMatchPlayerSnapshot[];
  leaderboardDeltas: PersistedLeaderboardDelta[];
}
