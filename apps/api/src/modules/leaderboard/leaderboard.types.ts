import type {
  PaginatedResult,
  PaginationOptions
} from "../../common/persistence/index.js";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarKey: string | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  bankruptcies: number;
  abandons: number;
  lastMatchAt: Date | null;
  updatedAt: Date;
}

export interface LeaderboardListOptions extends PaginationOptions {}

export type LeaderboardListResult = PaginatedResult<LeaderboardEntry>;