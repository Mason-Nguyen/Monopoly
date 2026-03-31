import { randomUUID } from "node:crypto";
import type { PlayerIdentity } from "@monopoly/shared-types";
import type { MatchEliminationRecord } from "../../src/persistence/snapshot.js";
import type { MonopolyRoom } from "../../src/rooms/MonopolyRoom.js";
import { initializeMonopolyRoomState } from "../../src/services/match-initialization.js";

export const PERSISTENCE_TEST_PLAYERS: PlayerIdentity[] = [
  {
    playerId: "f915889c-f7ad-4823-894e-c3ac0ebc4ee5",
    displayName: "An",
    isGuest: false
  },
  {
    playerId: "552f1fb2-b22c-44c5-bbc9-e4b7a412a328",
    displayName: "Binh",
    isGuest: false
  },
  {
    playerId: "19d03ac4-51d1-4bb1-aefa-321c9d9fc9f4",
    displayName: "Chi",
    isGuest: false
  },
  {
    playerId: "b31f1ca7-d58c-463f-b0ca-52e56c944943",
    displayName: "Dung",
    isGuest: false
  }
];

export function createFinishedPersistenceRoom() {
  const matchId = randomUUID();
  const startedAt = Date.now() - 120_000;
  const finishedAt = startedAt + 120_000;
  const state = initializeMonopolyRoomState({
    players: PERSISTENCE_TEST_PLAYERS,
    startedAt,
    sourceLobbyId: "phase10-persistence-tests",
    matchId
  });

  const an = state.players.get(PERSISTENCE_TEST_PLAYERS[0]!.playerId)!;
  const binh = state.players.get(PERSISTENCE_TEST_PLAYERS[1]!.playerId)!;
  const chi = state.players.get(PERSISTENCE_TEST_PLAYERS[2]!.playerId)!;
  const dung = state.players.get(PERSISTENCE_TEST_PLAYERS[3]!.playerId)!;

  an.position = 18;
  an.balance = 120;
  an.isAbandoned = true;
  an.connection.status = "abandoned";
  an.connection.reconnectDeadlineAt = 0;

  binh.position = 24;
  binh.balance = 1_840;
  binh.connection.status = "connected";
  binh.connection.reconnectDeadlineAt = 0;

  chi.position = 7;
  chi.balance = 0;
  chi.isBankrupt = true;
  chi.connection.status = "connected";
  chi.connection.reconnectDeadlineAt = 0;

  dung.position = 31;
  dung.balance = 0;
  dung.isBankrupt = true;
  dung.connection.status = "connected";
  dung.connection.reconnectDeadlineAt = 0;

  state.status = "finished";
  state.finishedAt = finishedAt;
  state.result.winnerPlayerId = binh.playerId;
  state.result.endReason = "last_player_remaining";
  state.result.finishedAt = finishedAt;

  const eliminationTimeline: MatchEliminationRecord[] = [
    {
      playerId: chi.playerId,
      reason: "bankrupt",
      eliminatedAt: finishedAt - 30_000,
      sequence: 1
    },
    {
      playerId: dung.playerId,
      reason: "bankrupt",
      eliminatedAt: finishedAt - 20_000,
      sequence: 2
    },
    {
      playerId: an.playerId,
      reason: "abandoned",
      eliminatedAt: finishedAt - 10_000,
      sequence: 3
    }
  ];

  const room = {
    state,
    eliminationTimeline,
    nextEliminationSequence: 4,
    completedMatchPersistencePromise: null,
    completedMatchPersistenceStatus: "idle",
    completedMatchPersistenceError: ""
  } as unknown as MonopolyRoom;

  return {
    room,
    matchId,
    finishedAt,
    userIds: {
      an: an.playerId,
      binh: binh.playerId,
      chi: chi.playerId,
      dung: dung.playerId
    }
  };
}