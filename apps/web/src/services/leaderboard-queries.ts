import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api-client";
import { queryKeys } from "./query-keys";

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  displayName: string;
  avatarKey: string | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  bankruptcies: number;
  abandons: number;
  lastMatchAt: string | null;
  updatedAt: string;
}

export interface LeaderboardListResult {
  entries: LeaderboardEntryDto[];
}

export interface LeaderboardDetailResult {
  entry: Omit<LeaderboardEntryDto, "rank">;
}

export async function fetchLeaderboard(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<LeaderboardListResult> {
  const { data } = await apiGet<LeaderboardListResult>("/leaderboard", {
    limit: params.limit ?? 12,
    offset: params.offset ?? 0
  });

  return data;
}

export async function fetchLeaderboardEntry(userId: string): Promise<LeaderboardDetailResult> {
  const { data } = await apiGet<LeaderboardDetailResult>(`/leaderboard/${userId}`);
  return data;
}

export function useLeaderboardQuery(params: {
  limit?: number;
  offset?: number;
} = {}) {
  const limit = params.limit ?? 12;
  const offset = params.offset ?? 0;

  return useQuery({
    queryKey: queryKeys.leaderboard.list(limit, offset),
    queryFn: () => fetchLeaderboard({ limit, offset })
  });
}

export function useLeaderboardEntryQuery(userId: string | null) {
  return useQuery({
    enabled: typeof userId === "string" && userId.length > 0,
    queryKey: queryKeys.leaderboard.detail(userId ?? "missing"),
    queryFn: () => fetchLeaderboardEntry(userId ?? "")
  });
}