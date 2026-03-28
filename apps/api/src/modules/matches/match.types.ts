import type {
  PaginatedResult,
  PaginationOptions
} from "../../common/persistence/index.js";

export interface MatchPlayerSummary {
  userId: string;
  displayNameSnapshot: string;
  turnOrder: number;
  finalBalance: number | null;
  finalPosition: number | null;
  finalRank: number | null;
  isBankrupt: boolean;
  isAbandoned: boolean;
  eliminationReason: string | null;
}

export interface MatchSummary {
  matchId: string;
  sourceLobbyId: string | null;
  boardConfigKey: string;
  status: "playing" | "finished";
  startedAt: Date;
  finishedAt: Date | null;
  endReason: string | null;
  winnerUserId: string | null;
  playerCount: number;
  players: MatchPlayerSummary[];
}

export interface MatchListOptions extends PaginationOptions {}

export type MatchListResult = PaginatedResult<MatchSummary>;