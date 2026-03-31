import { getGameServerPersistenceDatabaseConfig } from "../persistence/config.js";
import { buildCompletedMatchPersistenceSnapshot } from "../persistence/snapshot.js";
import { broadcastEngineTransitionEvents } from "./gameplay-event-broadcast.js";
async function resolveCompletedMatchRepository(repository) {
    if (repository) {
        return repository;
    }
    const module = await import("../persistence/repositories/completed-match.repository.js");
    return module.createCompletedMatchPersistenceRepository();
}
function recordEliminationTimeline(room, transitionResult, now) {
    for (const event of transitionResult.events) {
        if (event.type !== "player_eliminated") {
            continue;
        }
        const alreadyRecorded = room.eliminationTimeline.some((record) => record.playerId === event.playerId);
        if (alreadyRecorded) {
            continue;
        }
        const eliminationRecord = {
            playerId: event.playerId,
            reason: event.reason,
            eliminatedAt: now,
            sequence: room.nextEliminationSequence++
        };
        room.eliminationTimeline.push(eliminationRecord);
    }
}
export function canPersistCompletedMatches() {
    return getGameServerPersistenceDatabaseConfig().isConfigured;
}
export async function findPersistedCompletedMatchById(matchId, repository) {
    const resolvedRepository = await resolveCompletedMatchRepository(repository);
    return resolvedRepository.findCompletedMatchById(matchId);
}
export async function persistCompletedMatchSnapshot(snapshot, repository) {
    const resolvedRepository = await resolveCompletedMatchRepository(repository);
    await resolvedRepository.persistCompletedMatchSnapshot(snapshot);
}
export async function persistCompletedMonopolyRoomIfNeeded(room, repository) {
    if (room.state.status !== "finished") {
        return;
    }
    if (!canPersistCompletedMatches()) {
        room.completedMatchPersistenceStatus = "skipped_not_configured";
        return;
    }
    if (room.completedMatchPersistenceStatus === "persisted") {
        return;
    }
    if (room.completedMatchPersistencePromise) {
        await room.completedMatchPersistencePromise;
        return;
    }
    room.completedMatchPersistenceStatus = "persisting";
    room.completedMatchPersistenceError = "";
    const persistencePromise = (async () => {
        const resolvedRepository = await resolveCompletedMatchRepository(repository);
        const snapshot = buildCompletedMatchPersistenceSnapshot(room.state, room.eliminationTimeline);
        const existing = await findPersistedCompletedMatchById(snapshot.match.matchId, resolvedRepository);
        if (!existing) {
            await persistCompletedMatchSnapshot(snapshot, resolvedRepository);
        }
        room.completedMatchPersistenceStatus = "persisted";
    })()
        .catch((error) => {
        room.completedMatchPersistenceStatus = "failed";
        room.completedMatchPersistenceError =
            error instanceof Error ? error.message : String(error);
        console.error(`[GameServer] Failed to persist completed match ${room.state.matchId}:`, error);
        throw error;
    })
        .finally(() => {
        room.completedMatchPersistencePromise = null;
    });
    room.completedMatchPersistencePromise = persistencePromise;
    await persistencePromise;
}
export function processMonopolyRoomTransition(room, transitionResult, options = {}) {
    const now = options.now ?? Date.now();
    recordEliminationTimeline(room, transitionResult, now);
    broadcastEngineTransitionEvents(room, transitionResult);
    if (room.state.status === "finished") {
        void persistCompletedMonopolyRoomIfNeeded(room).catch(() => undefined);
    }
}
