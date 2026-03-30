import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import type {
  EliminationReason,
  MatchEndReason,
  PlayerId,
  UnixTimestampMs
} from "@monopoly/shared-types";
import type {
  MatchPlayerStateSchema,
  MonopolyRoomStateSchema
} from "../schemas/index.js";
import type {
  CompletedMatchPersistenceSnapshot,
  PersistedLeaderboardDelta,
  PersistedMatchPlayerSnapshot
} from "./contracts.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface MatchEliminationRecord {
  playerId: PlayerId;
  reason: EliminationReason;
  eliminatedAt: UnixTimestampMs;
  sequence: number;
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isUuidLike(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function getPlayersInTurnOrder(
  roomState: MonopolyRoomStateSchema
): MatchPlayerStateSchema[] {
  return Array.from(roomState.players.values()).sort((left, right) => left.turnOrder - right.turnOrder);
}

function getBoardStartingMoney(boardConfigKey: string): number {
  if (boardConfigKey === CLASSIC_BOARD_CONFIG.boardId) {
    return CLASSIC_BOARD_CONFIG.startingMoney;
  }

  throw new Error(`Unsupported board config ${boardConfigKey} for completed-match persistence.`);
}

function resolveFinishedAt(roomState: MonopolyRoomStateSchema): number {
  if (roomState.result.finishedAt > 0) {
    return roomState.result.finishedAt;
  }

  if (roomState.finishedAt > 0) {
    return roomState.finishedAt;
  }

  throw new Error(`Finished match ${roomState.matchId} does not have a resolved finishedAt timestamp.`);
}

function resolveEndReason(roomState: MonopolyRoomStateSchema): MatchEndReason {
  const endReason = roomState.result.endReason;

  assertCondition(endReason !== "", `Finished match ${roomState.matchId} is missing an endReason.`);
  return endReason as MatchEndReason;
}

function resolveWinnerUserId(roomState: MonopolyRoomStateSchema): PlayerId {
  const winnerUserId = roomState.result.winnerPlayerId;

  assertCondition(
    winnerUserId !== "" && roomState.players.has(winnerUserId),
    `Finished match ${roomState.matchId} is missing a valid winnerPlayerId.`
  );

  return winnerUserId;
}

function resolveEliminationReason(
  player: MatchPlayerStateSchema
): EliminationReason | null {
  if (player.isBankrupt) {
    return "bankrupt";
  }

  if (player.isAbandoned) {
    return "abandoned";
  }

  return null;
}

function buildFinalRankMap(
  players: MatchPlayerStateSchema[],
  winnerUserId: string,
  eliminationTimeline: MatchEliminationRecord[]
): Map<string, number> {
  const finalRanks = new Map<string, number>();
  const timelineByPlayerId = new Map(eliminationTimeline.map((record) => [record.playerId, record]));

  finalRanks.set(winnerUserId, 1);

  const nonWinnerPlayers = players.filter((player) => player.playerId !== winnerUserId);
  const playersWithRecordedElimination = nonWinnerPlayers
    .filter((player) => timelineByPlayerId.has(player.playerId))
    .sort((left, right) => {
      const leftRecord = timelineByPlayerId.get(left.playerId)!;
      const rightRecord = timelineByPlayerId.get(right.playerId)!;

      return (
        leftRecord.sequence - rightRecord.sequence ||
        leftRecord.eliminatedAt - rightRecord.eliminatedAt ||
        left.turnOrder - right.turnOrder
      );
    });
  const playersWithoutRecordedElimination = nonWinnerPlayers
    .filter((player) => !timelineByPlayerId.has(player.playerId))
    .sort((left, right) => {
      const leftEliminated = Number(resolveEliminationReason(left) !== null);
      const rightEliminated = Number(resolveEliminationReason(right) !== null);

      return rightEliminated - leftEliminated || left.turnOrder - right.turnOrder;
    });

  const eliminationOrder = [
    ...playersWithRecordedElimination,
    ...playersWithoutRecordedElimination
  ];

  eliminationOrder.forEach((player, index) => {
    finalRanks.set(player.playerId, players.length - index);
  });

  assertCondition(
    finalRanks.size === players.length,
    "Completed-match rank derivation produced an incomplete rank map."
  );

  const sortedRanks = Array.from(finalRanks.values()).sort((left, right) => left - right);
  assertCondition(
    sortedRanks.every((rank, index) => rank === index + 1),
    "Completed-match rank derivation produced duplicate or missing ranks."
  );

  return finalRanks;
}

function createLeaderboardDelta(
  userId: PlayerId,
  winnerUserId: PlayerId,
  eliminationReason: EliminationReason | null,
  finishedAt: UnixTimestampMs
): PersistedLeaderboardDelta {
  const isWinner = userId === winnerUserId;

  return {
    userId,
    matchesPlayedDelta: 1,
    winsDelta: isWinner ? 1 : 0,
    lossesDelta: isWinner ? 0 : 1,
    bankruptciesDelta: eliminationReason === "bankrupt" ? 1 : 0,
    abandonsDelta: eliminationReason === "abandoned" ? 1 : 0,
    lastMatchAt: finishedAt
  };
}

function createPersistedPlayerSnapshot(
  roomState: MonopolyRoomStateSchema,
  player: MatchPlayerStateSchema,
  finalRankMap: Map<string, number>,
  eliminationTimeline: MatchEliminationRecord[],
  finishedAt: UnixTimestampMs
): PersistedMatchPlayerSnapshot {
  const eliminationReason = resolveEliminationReason(player);
  const eliminationRecord = eliminationTimeline.find((record) => record.playerId === player.playerId);
  const finalRank = finalRankMap.get(player.playerId);

  assertCondition(finalRank !== undefined, `Missing final rank for player ${player.playerId}.`);
  assertCondition(
    player.playerId !== "" && isUuidLike(player.playerId),
    `Player ${player.playerId || "<empty>"} cannot be persisted because it is not a UUID.`
  );

  return {
    matchId: roomState.matchId,
    userId: player.playerId,
    displayNameSnapshot: player.displayName,
    turnOrder: player.turnOrder,
    startBalance: getBoardStartingMoney(roomState.board.boardId),
    finalBalance: player.balance,
    finalPosition: player.position,
    finalRank,
    isBankrupt: player.isBankrupt,
    isAbandoned: player.isAbandoned,
    eliminationReason,
    eliminatedAt:
      eliminationReason !== null
        ? (eliminationRecord?.eliminatedAt ?? finishedAt)
        : null
  };
}

export function buildCompletedMatchPersistenceSnapshot(
  roomState: MonopolyRoomStateSchema,
  eliminationTimeline: MatchEliminationRecord[]
): CompletedMatchPersistenceSnapshot {
  assertCondition(roomState.status === "finished", "Only finished matches can be persisted.");
  assertCondition(roomState.matchId !== "", "Finished match is missing matchId.");
  assertCondition(isUuidLike(roomState.matchId), `Match ${roomState.matchId} is not a UUID.`);
  assertCondition(roomState.board.boardId !== "", "Finished match is missing board config key.");
  assertCondition(roomState.players.size >= 2, "Finished match must have at least two players.");

  const finishedAt = resolveFinishedAt(roomState);
  const endReason = resolveEndReason(roomState);
  const winnerUserId = resolveWinnerUserId(roomState);
  const players = getPlayersInTurnOrder(roomState);
  const finalRankMap = buildFinalRankMap(players, winnerUserId, eliminationTimeline);
  const persistedPlayers = players.map((player) =>
    createPersistedPlayerSnapshot(roomState, player, finalRankMap, eliminationTimeline, finishedAt)
  );

  assertCondition(
    new Set(persistedPlayers.map((player) => player.turnOrder)).size === persistedPlayers.length,
    "Finished match contains duplicate turnOrder values."
  );

  return {
    match: {
      matchId: roomState.matchId,
      sourceLobbyId: roomState.sourceLobbyId !== "" ? roomState.sourceLobbyId : null,
      boardConfigKey: roomState.board.boardId,
      status: "finished",
      startedAt: roomState.startedAt,
      finishedAt,
      endReason,
      winnerUserId,
      playerCount: roomState.players.size
    },
    players: persistedPlayers,
    leaderboardDeltas: persistedPlayers.map((player) =>
      createLeaderboardDelta(player.userId, winnerUserId, player.eliminationReason, finishedAt)
    )
  };
}
