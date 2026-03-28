import {
  LOBBY_ERROR_EVENT,
  LOBBY_MATCH_STARTING_EVENT,
  LOBBY_SET_READY_COMMAND,
  LOBBY_START_MATCH_COMMAND,
  type LobbySetReadyCommand
} from "@monopoly/shared-types";
import type { Client } from "colyseus";
import type { LobbyRoom } from "../rooms/LobbyRoom.js";
import { createMatchId } from "../lib/index.js";

function getPlayerIdFromClient(client: Client): string {
  return String(client.userData?.playerId ?? "");
}

function canStartMatch(room: LobbyRoom): boolean {
  if (room.state.status !== "waiting") {
    return false;
  }

  const players = Array.from(room.state.players.values());
  if (players.length < room.state.minPlayers || players.length > room.state.maxPlayers) {
    return false;
  }

  return players.every((player) => player.isReady);
}

function updateLobbyComputedState(room: LobbyRoom): void {
  room.state.playerCount = room.state.players.size;
  room.state.canStartMatch = canStartMatch(room);
}

function sendLobbyError(client: Client, code: string, message: string): void {
  client.send(LOBBY_ERROR_EVENT, { code, message });
}

export function syncLobbyState(room: LobbyRoom): void {
  updateLobbyComputedState(room);
  room.refreshMetadata();
}

export function createLobbyMessageHandlers(room: LobbyRoom) {
  return {
    [LOBBY_SET_READY_COMMAND]: (client: Client, payload: LobbySetReadyCommand) => {
      const playerId = getPlayerIdFromClient(client);
      const player = room.state.players.get(playerId);

      if (!player) {
        sendLobbyError(client, "INVALID_PAYLOAD", "Player is not registered in this lobby.");
        return;
      }

      if (typeof payload?.isReady !== "boolean") {
        sendLobbyError(client, "INVALID_PAYLOAD", "The ready payload must contain a boolean 'isReady'.");
        return;
      }

      player.isReady = payload.isReady;
      syncLobbyState(room);
    },

    [LOBBY_START_MATCH_COMMAND]: (client: Client) => {
      const playerId = getPlayerIdFromClient(client);

      if (playerId !== room.state.hostPlayerId) {
        sendLobbyError(client, "NOT_HOST", "Only the lobby host can start the match.");
        return;
      }

      if (room.state.status !== "waiting") {
        sendLobbyError(client, "ROOM_NOT_WAITING", "The lobby is not accepting a match start right now.");
        return;
      }

      if (room.state.players.size < room.state.minPlayers) {
        sendLobbyError(client, "NOT_ENOUGH_PLAYERS", "The lobby does not have enough players to start.");
        return;
      }

      if (!canStartMatch(room)) {
        sendLobbyError(client, "PLAYERS_NOT_READY", "All players must be ready before the host can start.");
        return;
      }

      room.state.status = "starting";
      room.state.canStartMatch = false;
      room.refreshMetadata();

      room.broadcast(
        LOBBY_MATCH_STARTING_EVENT,
        {
          lobbyId: room.state.lobbyId,
          matchId: createMatchId(),
          transferDeadlineAt: Date.now() + 30_000
        },
        { afterNextPatch: true }
      );
    }
  };
}