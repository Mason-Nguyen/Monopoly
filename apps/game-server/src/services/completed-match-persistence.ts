import type { EngineTransitionResult } from "@monopoly/game-engine";
import type { MonopolyRoom } from "../rooms/MonopolyRoom.js";
import {
  buildCompletedMatchPersistenceSnapshot,
  createCompletedMatchPersistenceRepository,
  isGameServerPersistenceConfigured,
  type CompletedMatchPersistenceRepository,
  type MatchEliminationRecord,
  type PersistedCompletedMatchRecord
} from "../persistence/index.js";
import { broadcastEngineTransitionEvents } from "./gameplay-event-broadcast.js";

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
  return isGameServerPersistenceConfigured();
}

export async function findPersistedCompletedMatchById(
  matchId: string,
  repository: CompletedMatchPersistenceRepository = createCompletedMatchPersistenceRepository()
): Promise<PersistedCompletedMatchRecord | null> {
  return repository.findCompletedMatchById(matchId);
}

export async function persistCompletedMatchSnapshot(
  snapshot: ReturnType<typeof buildCompletedMatchPersistenceSnapshot>,
  repository: CompletedMatchPersistenceRepository = createCompletedMatchPersistenceRepository()
): Promise<void> {
  await repository.persistCompletedMatchSnapshot(snapshot);
}

export async function persistCompletedMonopolyRoomIfNeeded(
  room: MonopolyRoom,
  repository: CompletedMatchPersistenceRepository = createCompletedMatchPersistenceRepository()
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
    const snapshot = buildCompletedMatchPersistenceSnapshot(
      room.state,
      room.eliminationTimeline
    );
    const existing = await findPersistedCompletedMatchById(snapshot.match.matchId, repository);

    if (!existing) {
      await persistCompletedMatchSnapshot(snapshot, repository);
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
