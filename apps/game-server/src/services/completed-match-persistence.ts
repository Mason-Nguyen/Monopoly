import type { EngineTransitionResult } from "@monopoly/game-engine";
import type { MonopolyRoom } from "../rooms/MonopolyRoom.js";
import { getGameServerPersistenceDatabaseConfig } from "../persistence/config.js";
import {
  buildCompletedMatchPersistenceSnapshot,
  type MatchEliminationRecord
} from "../persistence/snapshot.js";
import type {
  CompletedMatchPersistenceRepository,
  PersistedCompletedMatchRecord
} from "../persistence/repositories/completed-match.repository.js";
import { broadcastEngineTransitionEvents } from "./gameplay-event-broadcast.js";

async function resolveCompletedMatchRepository(
  repository?: CompletedMatchPersistenceRepository
): Promise<CompletedMatchPersistenceRepository> {
  if (repository) {
    return repository;
  }

  const module = await import("../persistence/repositories/completed-match.repository.js");
  return module.createCompletedMatchPersistenceRepository();
}

function recordEliminationTimeline(
  room: MonopolyRoom,
  transitionResult: EngineTransitionResult,
  now: number
): void {
  for (const event of transitionResult.events) {
    if (event.type !== "player_eliminated") {
      continue;
    }

    const alreadyRecorded = room.eliminationTimeline.some(
      (record) => record.playerId === event.playerId
    );

    if (alreadyRecorded) {
      continue;
    }

    const eliminationRecord: MatchEliminationRecord = {
      playerId: event.playerId,
      reason: event.reason,
      eliminatedAt: now,
      sequence: room.nextEliminationSequence++
    };

    room.eliminationTimeline.push(eliminationRecord);
  }
}

export function canPersistCompletedMatches(): boolean {
  return getGameServerPersistenceDatabaseConfig().isConfigured;
}

export async function findPersistedCompletedMatchById(
  matchId: string,
  repository?: CompletedMatchPersistenceRepository
): Promise<PersistedCompletedMatchRecord | null> {
  const resolvedRepository = await resolveCompletedMatchRepository(repository);
  return resolvedRepository.findCompletedMatchById(matchId);
}

export async function persistCompletedMatchSnapshot(
  snapshot: ReturnType<typeof buildCompletedMatchPersistenceSnapshot>,
  repository?: CompletedMatchPersistenceRepository
): Promise<void> {
  const resolvedRepository = await resolveCompletedMatchRepository(repository);
  await resolvedRepository.persistCompletedMatchSnapshot(snapshot);
}

export async function persistCompletedMonopolyRoomIfNeeded(
  room: MonopolyRoom,
  repository?: CompletedMatchPersistenceRepository
): Promise<void> {
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
    const snapshot = buildCompletedMatchPersistenceSnapshot(
      room.state,
      room.eliminationTimeline
    );
    const existing = await findPersistedCompletedMatchById(
      snapshot.match.matchId,
      resolvedRepository
    );

    if (!existing) {
      await persistCompletedMatchSnapshot(snapshot, resolvedRepository);
    }

    room.completedMatchPersistenceStatus = "persisted";
  })()
    .catch((error) => {
      room.completedMatchPersistenceStatus = "failed";
      room.completedMatchPersistenceError =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[GameServer] Failed to persist completed match ${room.state.matchId}:`,
        error
      );
      throw error;
    })
    .finally(() => {
      room.completedMatchPersistencePromise = null;
    });

  room.completedMatchPersistencePromise = persistencePromise;
  await persistencePromise;
}

export interface ProcessMonopolyRoomTransitionOptions {
  now?: number;
}

export function processMonopolyRoomTransition(
  room: MonopolyRoom,
  transitionResult: EngineTransitionResult,
  options: ProcessMonopolyRoomTransitionOptions = {}
): void {
  const now = options.now ?? Date.now();

  recordEliminationTimeline(room, transitionResult, now);
  broadcastEngineTransitionEvents(room, transitionResult);

  if (room.state.status === "finished") {
    void persistCompletedMonopolyRoomIfNeeded(room).catch(() => undefined);
  }
}
