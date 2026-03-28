import {
  GAME_BUY_PROPERTY_COMMAND,
  GAME_DICE_ROLLED_EVENT,
  GAME_END_TURN_COMMAND,
  GAME_ERROR_EVENT,
  GAME_ROLL_DICE_COMMAND,
  type GameBuyPropertyCommand
} from "@monopoly/shared-types";
import type { Client } from "colyseus";
import type { MonopolyRoom } from "../rooms/MonopolyRoom.js";

function getPlayerIdFromClient(client: Client): string {
  return String(client.userData?.playerId ?? "");
}

function sendGameError(client: Client, code: string, message: string): void {
  client.send(GAME_ERROR_EVENT, { code, message });
}

function isActivePlayer(room: MonopolyRoom, playerId: string): boolean {
  return room.state.turn.activePlayerId === playerId;
}

export function createGameMessageHandlers(room: MonopolyRoom) {
  return {
    [GAME_ROLL_DICE_COMMAND]: (client: Client) => {
      const playerId = getPlayerIdFromClient(client);

      if (room.state.status !== "playing") {
        sendGameError(client, "MATCH_NOT_PLAYING", "The match is not in a playable state.");
        return;
      }

      if (!isActivePlayer(room, playerId)) {
        sendGameError(client, "NOT_ACTIVE_PLAYER", "Only the active player can roll the dice.");
        return;
      }

      if (room.state.turn.phase !== "await_roll") {
        sendGameError(client, "INVALID_TURN_PHASE", "The current turn phase does not allow dice rolling.");
        return;
      }

      const diceValueA = Math.floor(Math.random() * 6) + 1;
      const diceValueB = Math.floor(Math.random() * 6) + 1;
      const diceTotal = diceValueA + diceValueB;

      room.state.turn.diceValueA = diceValueA;
      room.state.turn.diceValueB = diceValueB;
      room.state.turn.diceTotal = diceTotal;
      room.state.turn.phase = "await_end_turn";
      room.state.turn.awaitingInput = true;

      room.broadcast(
        GAME_DICE_ROLLED_EVENT,
        {
          playerId,
          diceValueA,
          diceValueB,
          diceTotal
        },
        { afterNextPatch: true }
      );
    },

    [GAME_BUY_PROPERTY_COMMAND]: (client: Client, payload: GameBuyPropertyCommand) => {
      const playerId = getPlayerIdFromClient(client);

      if (!isActivePlayer(room, playerId)) {
        sendGameError(client, "NOT_ACTIVE_PLAYER", "Only the active player can buy the current property.");
        return;
      }

      if (typeof payload?.propertyId !== "string" || payload.propertyId.length === 0) {
        sendGameError(client, "INVALID_PAYLOAD", "A propertyId string is required.");
        return;
      }

      sendGameError(client, "PROPERTY_NOT_BUYABLE", "Property purchasing will be completed in the gameplay implementation phase.");
    },

    [GAME_END_TURN_COMMAND]: (client: Client) => {
      const playerId = getPlayerIdFromClient(client);

      if (!isActivePlayer(room, playerId)) {
        sendGameError(client, "NOT_ACTIVE_PLAYER", "Only the active player can end the turn.");
        return;
      }

      if (room.state.turn.phase !== "await_end_turn") {
        sendGameError(client, "INVALID_TURN_PHASE", "The turn cannot be ended yet.");
        return;
      }

      const orderedPlayers = Array.from(room.state.players.values())
        .filter((player) => !player.isBankrupt && !player.isAbandoned)
        .sort((left, right) => left.turnOrder - right.turnOrder);

      if (orderedPlayers.length === 0) {
        sendGameError(client, "MATCH_NOT_PLAYING", "No active players remain in the match.");
        return;
      }

      const currentIndex = orderedPlayers.findIndex((player) => player.playerId === playerId);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % orderedPlayers.length : 0;
      const nextPlayer = orderedPlayers[nextIndex];

      if (!nextPlayer) {
        sendGameError(client, "MATCH_NOT_PLAYING", "A next player could not be resolved.");
        return;
      }

      room.state.turn.turnNumber += 1;
      room.state.turn.activePlayerId = nextPlayer.playerId;
      room.state.turn.phase = "await_roll";
      room.state.turn.diceTotal = 0;
      room.state.turn.diceValueA = 0;
      room.state.turn.diceValueB = 0;
      room.state.turn.currentTileIndex = -1;
      room.state.turn.canBuyCurrentProperty = false;
      room.state.turn.awaitingInput = true;
    }
  };
}