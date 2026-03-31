import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api-client";
import { queryKeys } from "./query-keys";

export interface MatchPlayerSummaryDto {
  userId: string;
  displayNameSnapshot: string;
  turnOrder: number;
  finalBalance: number;
  finalPosition: number;
  finalRank: number;
  isBankrupt: boolean;
  isAbandoned: boolean;
  eliminationReason: string | null;
}

export interface MatchSummaryDto {
  matchId: string;
  sourceLobbyId: string | null;
  boardConfigKey: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  endReason: string | null;
  winnerUserId: string | null;
  playerCount: number;
  players: MatchPlayerSummaryDto[];
}

export interface MatchListResult {
  matches: MatchSummaryDto[];
}

export interface MatchDetailResult {
  match: MatchSummaryDto;
}

export async function fetchMatches(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<MatchListResult> {
  const { data } = await apiGet<MatchListResult>("/matches", {
    limit: params.limit ?? 10,
    offset: params.offset ?? 0
  });

  return data;
}

export async function fetchMatchDetail(matchId: string): Promise<MatchDetailResult> {
  const { data } = await apiGet<MatchDetailResult>(`/matches/${matchId}`);
  return data;
}

export function useMatchesQuery(params: {
  limit?: number;
  offset?: number;
} = {}) {
  const limit = params.limit ?? 10;
  const offset = params.offset ?? 0;

  return useQuery({
    queryKey: queryKeys.matches.list(limit, offset),
    queryFn: () => fetchMatches({ limit, offset })
  });
}

export function useMatchDetailQuery(matchId: string | null) {
  return useQuery({
    enabled: typeof matchId === "string" && matchId.length > 0,
    queryKey: queryKeys.matches.detail(matchId ?? "missing"),
    queryFn: () => fetchMatchDetail(matchId ?? "")
  });
}