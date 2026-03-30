import {
  MatchEndReason,
  MatchStatus,
  EliminationReason,
  type PrismaClient
} from "../../../generated/prisma/client.js";
import { getGameServerPrismaClient } from "../client.js";
import type { CompletedMatchPersistenceSnapshot } from "../contracts.js";

export interface PersistedCompletedMatchRecord {
  matchId: string;
  status: MatchStatus;
}

export interface CompletedMatchPersistenceRepository {
  findCompletedMatchById(matchId: string): Promise<PersistedCompletedMatchRecord | null>;
  persistCompletedMatchSnapshot(snapshot: CompletedMatchPersistenceSnapshot): Promise<void>;
}

export class PrismaCompletedMatchPersistenceRepository
  implements CompletedMatchPersistenceRepository {
  constructor(private readonly prisma: PrismaClient = getGameServerPrismaClient()) {}

  async findCompletedMatchById(matchId: string): Promise<PersistedCompletedMatchRecord | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true
      }
    });

    if (!match || match.status !== MatchStatus.finished) {
      return null;
    }

    return {
      matchId: match.id,
      status: match.status
    };
  }

  async persistCompletedMatchSnapshot(
    snapshot: CompletedMatchPersistenceSnapshot
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const existingMatch = await transaction.match.findUnique({
        where: { id: snapshot.match.matchId },
        select: {
          id: true,
          status: true
        }
      });

      if (existingMatch) {
        if (existingMatch.status === MatchStatus.finished) {
          return;
        }

        throw new Error(
          `Match ${snapshot.match.matchId} already exists with unexpected status ${existingMatch.status}.`
        );
      }

      await transaction.match.create({
        data: {
          id: snapshot.match.matchId,
          sourceLobbyId: snapshot.match.sourceLobbyId,
          boardConfigKey: snapshot.match.boardConfigKey,
          status: MatchStatus.finished,
          startedAt: new Date(snapshot.match.startedAt),
          finishedAt: new Date(snapshot.match.finishedAt),
          endReason: MatchEndReason[snapshot.match.endReason],
          winnerUserId: snapshot.match.winnerUserId,
          playerCount: snapshot.match.playerCount
        }
      });

      await transaction.matchPlayer.createMany({
        data: snapshot.players.map((player) => ({
          matchId: player.matchId,
          userId: player.userId,
          displayNameSnapshot: player.displayNameSnapshot,
          turnOrder: player.turnOrder,
          startBalance: player.startBalance,
          finalBalance: player.finalBalance,
          finalPosition: player.finalPosition,
          finalRank: player.finalRank,
          isBankrupt: player.isBankrupt,
          isAbandoned: player.isAbandoned,
          eliminationReason:
            player.eliminationReason !== null
              ? EliminationReason[player.eliminationReason]
              : null,
          eliminatedAt:
            player.eliminatedAt !== null ? new Date(player.eliminatedAt) : null
        }))
      });
    });
  }
}

export function createCompletedMatchPersistenceRepository(
  prisma: PrismaClient = getGameServerPrismaClient()
): CompletedMatchPersistenceRepository {
  return new PrismaCompletedMatchPersistenceRepository(prisma);
}
