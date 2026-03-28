import type {
  LeaderboardEntry,
  LeaderboardListOptions,
  LeaderboardListResult
} from "./leaderboard.types.js";
import {
  PrismaLeaderboardRepository,
  type LeaderboardRepository
} from "./leaderboard.repository.js";

export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository =
      new PrismaLeaderboardRepository()
  ) {}

  getLeaderboardEntryByUserId(userId: string): Promise<LeaderboardEntry | null> {
    return this.leaderboardRepository.findByUserId(userId);
  }

  listTopLeaderboardEntries(
    options: LeaderboardListOptions = {}
  ): Promise<LeaderboardListResult> {
    return this.leaderboardRepository.listTopEntries(options);
  }
}