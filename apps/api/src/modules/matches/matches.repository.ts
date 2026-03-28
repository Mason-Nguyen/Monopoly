import {
  normalizePaginationOptions,
  type PaginatedResult,
  type PaginationOptions,
  type PrismaDatabaseClient
} from "../../common/persistence/index.js";
import { getPrismaClient } from "../../prisma/index.js";
import type { MatchSummary } from "./match.types.js";

export interface MatchesRepository {
  findById(matchId: string): Promise<MatchSummary | null>;
  listRecent(options?: PaginationOptions): Promise<PaginatedResult<MatchSummary>>;
}

export class PrismaMatchesRepository implements MatchesRepository {
  constructor(
    private readonly prisma: PrismaDatabaseClient = getPrismaClient()
  ) {}

  async findById(matchId: string): Promise<MatchSummary | null> {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId
      },
      include: {
        players: {
          orderBy: {
            turnOrder: "asc"
          }
        }
      }
    });

    if (!match) {
      return null;
    }

    return {
      matchId: match.id,
      sourceLobbyId: match.sourceLobbyId,
      boardConfigKey: match.boardConfigKey,
      status: match.status,
      startedAt: match.startedAt,
      finishedAt: match.finishedAt,
      endReason: match.endReason,
      winnerUserId: match.winnerUserId,
      playerCount: match.playerCount,
      players: match.players.map((player) => ({
        userId: player.userId,
        displayNameSnapshot: player.displayNameSnapshot,
        turnOrder: player.turnOrder,
        finalBalance: player.finalBalance,
        finalPosition: player.finalPosition,
        finalRank: player.finalRank,
        isBankrupt: player.isBankrupt,
        isAbandoned: player.isAbandoned,
        eliminationReason: player.eliminationReason
      }))
    };
  }

  async listRecent(
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<MatchSummary>> {
    const { limit, offset } = normalizePaginationOptions(options);

    const matches = await this.prisma.match.findMany({
      include: {
        players: {
          orderBy: {
            turnOrder: "asc"
          }
        }
      },
      orderBy: [
        {
          startedAt: "desc"
        },
        {
          createdAt: "desc"
        }
      ],
      take: limit,
      skip: offset
    });

    return {
      items: matches.map((match) => ({
        matchId: match.id,
        sourceLobbyId: match.sourceLobbyId,
        boardConfigKey: match.boardConfigKey,
        status: match.status,
        startedAt: match.startedAt,
        finishedAt: match.finishedAt,
        endReason: match.endReason,
        winnerUserId: match.winnerUserId,
        playerCount: match.playerCount,
        players: match.players.map((player) => ({
          userId: player.userId,
          displayNameSnapshot: player.displayNameSnapshot,
          turnOrder: player.turnOrder,
          finalBalance: player.finalBalance,
          finalPosition: player.finalPosition,
          finalRank: player.finalRank,
          isBankrupt: player.isBankrupt,
          isAbandoned: player.isAbandoned,
          eliminationReason: player.eliminationReason
        }))
      })),
      limit,
      offset
    };
  }
}