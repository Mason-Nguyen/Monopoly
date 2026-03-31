import { MatchEndReason, MatchStatus, EliminationReason } from "../../../generated/prisma/client.js";
import { getGameServerPrismaClient } from "../client.js";
function resolveLatestMatchTimestamp(currentLastMatchAt, nextLastMatchAt) {
    if (currentLastMatchAt === null || currentLastMatchAt < nextLastMatchAt) {
        return nextLastMatchAt;
    }
    return currentLastMatchAt;
}
export class PrismaCompletedMatchPersistenceRepository {
    constructor(prisma = getGameServerPrismaClient()) {
        this.prisma = prisma;
    }
    async findCompletedMatchById(matchId) {
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
    async persistCompletedMatchSnapshot(snapshot) {
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
                throw new Error(`Match ${snapshot.match.matchId} already exists with unexpected status ${existingMatch.status}.`);
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
                    eliminationReason: player.eliminationReason !== null
                        ? EliminationReason[player.eliminationReason]
                        : null,
                    eliminatedAt: player.eliminatedAt !== null ? new Date(player.eliminatedAt) : null
                }))
            });
            for (const delta of snapshot.leaderboardDeltas) {
                await this.upsertLeaderboardDelta(transaction, delta);
            }
        });
    }
    async upsertLeaderboardDelta(transaction, delta) {
        const existingStat = await transaction.leaderboardStat.findUnique({
            where: { userId: delta.userId },
            select: {
                userId: true,
                lastMatchAt: true
            }
        });
        const nextLastMatchAt = new Date(delta.lastMatchAt);
        if (!existingStat) {
            await transaction.leaderboardStat.create({
                data: {
                    userId: delta.userId,
                    matchesPlayed: delta.matchesPlayedDelta,
                    wins: delta.winsDelta,
                    losses: delta.lossesDelta,
                    bankruptcies: delta.bankruptciesDelta,
                    abandons: delta.abandonsDelta,
                    lastMatchAt: nextLastMatchAt
                }
            });
            return;
        }
        await transaction.leaderboardStat.update({
            where: { userId: delta.userId },
            data: {
                matchesPlayed: {
                    increment: delta.matchesPlayedDelta
                },
                wins: {
                    increment: delta.winsDelta
                },
                losses: {
                    increment: delta.lossesDelta
                },
                bankruptcies: {
                    increment: delta.bankruptciesDelta
                },
                abandons: {
                    increment: delta.abandonsDelta
                },
                lastMatchAt: resolveLatestMatchTimestamp(existingStat.lastMatchAt, nextLastMatchAt)
            }
        });
    }
}
export function createCompletedMatchPersistenceRepository(prisma = getGameServerPrismaClient()) {
    return new PrismaCompletedMatchPersistenceRepository(prisma);
}
