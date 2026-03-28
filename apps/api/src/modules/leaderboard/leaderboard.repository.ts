import {
  normalizePaginationOptions,
  type PaginatedResult,
  type PaginationOptions,
  type PrismaDatabaseClient
} from "../../common/persistence/index.js";
import { getPrismaClient } from "../../prisma/index.js";
import type { LeaderboardEntry } from "./leaderboard.types.js";

export interface LeaderboardRepository {
  findByUserId(userId: string): Promise<LeaderboardEntry | null>;
  listTopEntries(
    options?: PaginationOptions
  ): Promise<PaginatedResult<LeaderboardEntry>>;
}

export class PrismaLeaderboardRepository implements LeaderboardRepository {
  constructor(
    private readonly prisma: PrismaDatabaseClient = getPrismaClient()
  ) {}

  async findByUserId(userId: string): Promise<LeaderboardEntry | null> {
    const entry = await this.prisma.leaderboardStat.findUnique({
      where: {
        userId
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!entry || !entry.user.profile) {
      return null;
    }

    return {
      userId: entry.userId,
      displayName: entry.user.profile.displayName,
      avatarKey: entry.user.profile.avatarKey,
      matchesPlayed: entry.matchesPlayed,
      wins: entry.wins,
      losses: entry.losses,
      bankruptcies: entry.bankruptcies,
      abandons: entry.abandons,
      lastMatchAt: entry.lastMatchAt,
      updatedAt: entry.updatedAt
    };
  }

  async listTopEntries(
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<LeaderboardEntry>> {
    const { limit, offset } = normalizePaginationOptions(options, {
      limit: 20,
      offset: 0
    });

    const entries = await this.prisma.leaderboardStat.findMany({
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: [
        {
          wins: "desc"
        },
        {
          matchesPlayed: "desc"
        },
        {
          updatedAt: "desc"
        }
      ],
      take: limit,
      skip: offset
    });

    return {
      items: entries
        .filter((entry) => entry.user.profile !== null)
        .map((entry) => ({
          userId: entry.userId,
          displayName: entry.user.profile!.displayName,
          avatarKey: entry.user.profile!.avatarKey,
          matchesPlayed: entry.matchesPlayed,
          wins: entry.wins,
          losses: entry.losses,
          bankruptcies: entry.bankruptcies,
          abandons: entry.abandons,
          lastMatchAt: entry.lastMatchAt,
          updatedAt: entry.updatedAt
        })),
      limit,
      offset
    };
  }
}