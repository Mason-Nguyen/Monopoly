import {
  createInitialMatchState,
  type CreateEngineMatchInput
} from "@monopoly/game-engine";
import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import type { PlayerIdentity } from "@monopoly/shared-types";
import { createMatchId } from "../lib/index.js";
import {
  createEmptyMonopolyRoomState,
  type MonopolyRoomCreateOptions,
  type MonopolyRoomStateSchema
} from "../schemas/index.js";
import { applyEngineStateToMonopolyRoomState } from "./engine-state-projection.js";

function toEnginePlayerSetup(
  players: PlayerIdentity[]
): CreateEngineMatchInput["players"] {
  return players.map((player, index) => ({
    playerId: player.playerId,
    displayName: player.displayName,
    turnOrder: index + 1
  }));
}

function markRoomPlayersAsReserved(
  roomState: MonopolyRoomStateSchema
): void {
  roomState.players.forEach((player) => {
    player.connection.status = "disconnected_reserved";
    player.connection.reconnectDeadlineAt = 0;
  });
}

export function initializeMonopolyRoomState(
  options: MonopolyRoomCreateOptions = {}
): MonopolyRoomStateSchema {
  const matchId = options.matchId ?? createMatchId();
  const startedAt = options.startedAt ?? Date.now();
  const players = options.players ?? [];
  const roomState = createEmptyMonopolyRoomState({
    ...options,
    matchId,
    startedAt
  });

  if (players.length === 0) {
    return roomState;
  }

  const engineState = createInitialMatchState({
    matchId,
    boardConfig: CLASSIC_BOARD_CONFIG,
    players: toEnginePlayerSetup(players),
    startedAt
  });

  applyEngineStateToMonopolyRoomState(roomState, engineState);
  markRoomPlayersAsReserved(roomState);
  return roomState;
}
