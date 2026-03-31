import assert from "node:assert/strict";
import test from "node:test";
import { disconnectGameServerPrismaClient, getGameServerPrismaClient } from "../src/persistence/client.js";
import { persistCompletedMonopolyRoomIfNeeded } from "../src/services/completed-match-persistence.js";
import { TestCleanupStack } from "./support/cleanup.js";
import { createFinishedPersistenceRoom, PERSISTENCE_TEST_PLAYERS } from "./support/persistence.js";
const hasDatabase = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
const persistenceTestOptions = {
    concurrency: false,
    skip: !hasDatabase,
    timeout: 60_000
};
function toComparableMap(rows) {
    return new Map(rows.map((row) => [row.userId, row]));
}
async function readLeaderboardSnapshot(userIds) {
    const prisma = getGameServerPrismaClient();
    const rows = await prisma.leaderboardStat.findMany({
        where: {
            userId: {
                in: userIds
            }
        },
        orderBy: {
            userId: "asc"
        }
    });
    return rows.map((row) => ({
        userId: row.userId,
        matchesPlayed: row.matchesPlayed,
        wins: row.wins,
        losses: row.losses,
        bankruptcies: row.bankruptcies,
        abandons: row.abandons,
        lastMatchAt: row.lastMatchAt
    }));
}
async function restoreLeaderboardSnapshot(rows) {
    const prisma = getGameServerPrismaClient();
    for (const row of rows) {
        await prisma.leaderboardStat.update({
            where: { userId: row.userId },
            data: {
                matchesPlayed: row.matchesPlayed,
                wins: row.wins,
                losses: row.losses,
                bankruptcies: row.bankruptcies,
                abandons: row.abandons,
                lastMatchAt: row.lastMatchAt
            }
        });
    }
}
function diffLeaderboardSnapshots(before, after) {
    const beforeMap = toComparableMap(before);
    const afterMap = toComparableMap(after);
    return PERSISTENCE_TEST_PLAYERS.map((player) => {
        const beforeRow = beforeMap.get(player.playerId);
        const afterRow = afterMap.get(player.playerId);
        return {
            userId: player.playerId,
            matchesPlayed: afterRow.matchesPlayed - beforeRow.matchesPlayed,
            wins: afterRow.wins - beforeRow.wins,
            losses: afterRow.losses - beforeRow.losses,
            bankruptcies: afterRow.bankruptcies - beforeRow.bankruptcies,
            abandons: afterRow.abandons - beforeRow.abandons,
            lastMatchAtChanged: String(beforeRow.lastMatchAt?.getTime() ?? null) !==
                String(afterRow.lastMatchAt?.getTime() ?? null)
        };
    });
}
function shouldLastMatchAtAdvance(lastMatchAt, finishedAt) {
    return lastMatchAt === null || lastMatchAt.getTime() < finishedAt;
}
function buildExpectedFirstPersistDeltas(userIds, beforeStats, finishedAt) {
    const beforeMap = toComparableMap(beforeStats);
    return [
        {
            userId: userIds.an,
            matchesPlayed: 1,
            wins: 0,
            losses: 1,
            bankruptcies: 0,
            abandons: 1,
            lastMatchAtChanged: shouldLastMatchAtAdvance(beforeMap.get(userIds.an)?.lastMatchAt ?? null, finishedAt)
        },
        {
            userId: userIds.binh,
            matchesPlayed: 1,
            wins: 1,
            losses: 0,
            bankruptcies: 0,
            abandons: 0,
            lastMatchAtChanged: shouldLastMatchAtAdvance(beforeMap.get(userIds.binh)?.lastMatchAt ?? null, finishedAt)
        },
        {
            userId: userIds.chi,
            matchesPlayed: 1,
            wins: 0,
            losses: 1,
            bankruptcies: 1,
            abandons: 0,
            lastMatchAtChanged: shouldLastMatchAtAdvance(beforeMap.get(userIds.chi)?.lastMatchAt ?? null, finishedAt)
        },
        {
            userId: userIds.dung,
            matchesPlayed: 1,
            wins: 0,
            losses: 1,
            bankruptcies: 1,
            abandons: 0,
            lastMatchAtChanged: shouldLastMatchAtAdvance(beforeMap.get(userIds.dung)?.lastMatchAt ?? null, finishedAt)
        }
    ];
}
test("finished room persistence writes matches, match_players, and leaderboard updates", persistenceTestOptions, async () => {
    const cleanup = new TestCleanupStack();
    const prisma = getGameServerPrismaClient();
    const { room, matchId, finishedAt, userIds } = createFinishedPersistenceRoom();
    const trackedUserIds = Object.values(userIds);
    const beforeStats = await readLeaderboardSnapshot(trackedUserIds);
    cleanup.add(async () => {
        await prisma.matchPlayer.deleteMany({ where: { matchId } });
        await prisma.match.deleteMany({ where: { id: matchId } });
        await restoreLeaderboardSnapshot(beforeStats);
        await disconnectGameServerPrismaClient();
    });
    try {
        await persistCompletedMonopolyRoomIfNeeded(room);
        const persistedMatch = await prisma.match.findUnique({
            where: { id: matchId },
            select: {
                id: true,
                status: true,
                winnerUserId: true,
                endReason: true,
                playerCount: true
            }
        });
        const persistedPlayers = await prisma.matchPlayer.findMany({
            where: { matchId },
            orderBy: { finalRank: "asc" },
            select: {
                userId: true,
                finalRank: true,
                isBankrupt: true,
                isAbandoned: true,
                eliminationReason: true
            }
        });
        const afterStats = await readLeaderboardSnapshot(trackedUserIds);
        const deltas = diffLeaderboardSnapshots(beforeStats, afterStats);
        assert.deepEqual(persistedMatch, {
            id: matchId,
            status: "finished",
            winnerUserId: userIds.binh,
            endReason: "last_player_remaining",
            playerCount: 4
        });
        assert.equal(persistedPlayers.length, 4);
        assert.deepEqual(persistedPlayers.map((player) => ({
            userId: player.userId,
            finalRank: player.finalRank,
            eliminationReason: player.eliminationReason,
            isBankrupt: player.isBankrupt,
            isAbandoned: player.isAbandoned
        })), [
            {
                userId: userIds.binh,
                finalRank: 1,
                eliminationReason: null,
                isBankrupt: false,
                isAbandoned: false
            },
            {
                userId: userIds.an,
                finalRank: 2,
                eliminationReason: "abandoned",
                isBankrupt: false,
                isAbandoned: true
            },
            {
                userId: userIds.dung,
                finalRank: 3,
                eliminationReason: "bankrupt",
                isBankrupt: true,
                isAbandoned: false
            },
            {
                userId: userIds.chi,
                finalRank: 4,
                eliminationReason: "bankrupt",
                isBankrupt: true,
                isAbandoned: false
            }
        ]);
        assert.deepEqual(deltas, buildExpectedFirstPersistDeltas(userIds, beforeStats, finishedAt));
        assert.equal(room.completedMatchPersistenceStatus, "persisted");
        assert.equal(room.completedMatchPersistenceError, "");
    }
    finally {
        await cleanup.run();
    }
});
test("persisting the same finished room twice is a no-op for rows and leaderboard counters", persistenceTestOptions, async () => {
    const cleanup = new TestCleanupStack();
    const prisma = getGameServerPrismaClient();
    const { room, matchId, finishedAt, userIds } = createFinishedPersistenceRoom();
    const trackedUserIds = Object.values(userIds);
    const beforeStats = await readLeaderboardSnapshot(trackedUserIds);
    cleanup.add(async () => {
        await prisma.matchPlayer.deleteMany({ where: { matchId } });
        await prisma.match.deleteMany({ where: { id: matchId } });
        await restoreLeaderboardSnapshot(beforeStats);
        await disconnectGameServerPrismaClient();
    });
    try {
        await persistCompletedMonopolyRoomIfNeeded(room);
        const afterFirstPersist = await readLeaderboardSnapshot(trackedUserIds);
        const firstDeltas = diffLeaderboardSnapshots(beforeStats, afterFirstPersist);
        await persistCompletedMonopolyRoomIfNeeded(room);
        const afterSecondPersist = await readLeaderboardSnapshot(trackedUserIds);
        const secondDeltas = diffLeaderboardSnapshots(afterFirstPersist, afterSecondPersist);
        const persistedMatchCount = await prisma.match.count({ where: { id: matchId } });
        const persistedMatchPlayerCount = await prisma.matchPlayer.count({ where: { matchId } });
        assert.deepEqual(firstDeltas, buildExpectedFirstPersistDeltas(userIds, beforeStats, finishedAt));
        assert.deepEqual(secondDeltas, [
            {
                userId: userIds.an,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                bankruptcies: 0,
                abandons: 0,
                lastMatchAtChanged: false
            },
            {
                userId: userIds.binh,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                bankruptcies: 0,
                abandons: 0,
                lastMatchAtChanged: false
            },
            {
                userId: userIds.chi,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                bankruptcies: 0,
                abandons: 0,
                lastMatchAtChanged: false
            },
            {
                userId: userIds.dung,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                bankruptcies: 0,
                abandons: 0,
                lastMatchAtChanged: false
            }
        ]);
        assert.equal(persistedMatchCount, 1);
        assert.equal(persistedMatchPlayerCount, 4);
        assert.equal(room.completedMatchPersistenceStatus, "persisted");
    }
    finally {
        await cleanup.run();
    }
});
