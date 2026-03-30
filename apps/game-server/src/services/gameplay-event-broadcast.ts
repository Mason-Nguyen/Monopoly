import type { EngineEvent, EngineTileResolvedEvent, EngineTransitionResult } from "@monopoly/game-engine";
import {
  GAME_DICE_ROLLED_EVENT,
  GAME_PAYMENT_APPLIED_EVENT,
  GAME_PLAYER_ELIMINATED_EVENT,
  GAME_PLAYER_MOVED_EVENT,
  GAME_PROPERTY_PURCHASED_EVENT,
  GAME_RESULT_READY_EVENT,
  GAME_TILE_RESOLVED_EVENT,
  type GameDiceRolledEvent,
  type GameEventName,
  type GamePaymentAppliedEvent,
  type GamePlayerEliminatedEvent,
  type GamePlayerMovedEvent,
  type GamePropertyPurchasedEvent,
  type GameResultReadyEvent,
  type GameTileResolvedEvent,
  type TileResolutionSummaryCode
} from "@monopoly/shared-types";
import type { MonopolyRoom } from "../rooms/MonopolyRoom.js";
import type { MonopolyRoomStateSchema } from "../schemas/index.js";

interface BroadcastInstruction {
  eventName: GameEventName;
  payload:
    | GameDiceRolledEvent
    | GamePlayerMovedEvent
    | GameTileResolvedEvent
    | GamePaymentAppliedEvent
    | GamePropertyPurchasedEvent
    | GamePlayerEliminatedEvent
    | GameResultReadyEvent;
}

function getPlayerLabel(roomState: MonopolyRoomStateSchema, playerId: string): string {
  return roomState.players.get(playerId)?.displayName || playerId;
}

function getTileName(roomState: MonopolyRoomStateSchema, tileIndex: number): string {
  return roomState.board.tiles.find((tile) => tile.tileIndex === tileIndex)?.name || `Tile ${tileIndex}`;
}

function resolveTileSummaryCode(event: EngineTileResolvedEvent): TileResolutionSummaryCode {
  switch (event.tileType) {
    case "start":
      return "LANDED_ON_START";
    case "tax":
      return "PAID_TAX";
    case "go_to_jail":
      return "WENT_TO_JAIL";
    case "property":
      if (event.ownerPlayerId === null || event.ownerPlayerId === undefined) {
        return "PROPERTY_AVAILABLE";
      }

      if (event.ownerPlayerId !== event.playerId) {
        return "PAID_RENT";
      }

      return "NO_EFFECT";
    default:
      return "NO_EFFECT";
  }
}

function createTileResolvedMessage(
  roomState: MonopolyRoomStateSchema,
  event: EngineTileResolvedEvent,
  summaryCode: TileResolutionSummaryCode
): string {
  const playerLabel = getPlayerLabel(roomState, event.playerId);
  const tileName = getTileName(roomState, event.tileIndex);

  switch (summaryCode) {
    case "LANDED_ON_START":
      return `${playerLabel} landed on ${tileName}.`;
    case "PROPERTY_AVAILABLE":
      if (roomState.turn.canBuyCurrentProperty) {
        return `${tileName} is available for purchase.`;
      }

      return `${tileName} is unowned, but ${playerLabel} cannot afford it right now.`;
    case "PAID_RENT": {
      const ownerLabel = event.ownerPlayerId ? getPlayerLabel(roomState, event.ownerPlayerId) : "the bank";
      return `${playerLabel} paid rent to ${ownerLabel} on ${tileName}.`;
    }
    case "PAID_TAX":
      return event.taxAmount
        ? `${playerLabel} paid ${event.taxAmount} in tax at ${tileName}.`
        : `${playerLabel} paid tax at ${tileName}.`;
    case "WENT_TO_JAIL":
      return `${playerLabel} was sent to Jail.`;
    case "NO_EFFECT":
    default:
      if (event.tileType === "property" && event.ownerPlayerId === event.playerId) {
        return `${playerLabel} landed on their own property, ${tileName}.`;
      }

      if (event.tileType === "jail") {
        return `${playerLabel} is visiting Jail.`;
      }

      return `${playerLabel} landed on ${tileName}.`;
  }
}

function mapEngineEventToBroadcastInstructions(
  roomState: MonopolyRoomStateSchema,
  event: EngineEvent
): BroadcastInstruction[] {
  switch (event.type) {
    case "dice_rolled":
      return [
        {
          eventName: GAME_DICE_ROLLED_EVENT,
          payload: {
            playerId: event.playerId,
            diceValueA: event.dice.valueA,
            diceValueB: event.dice.valueB,
            diceTotal: event.dice.total
          }
        }
      ];
    case "player_moved":
      return [
        {
          eventName: GAME_PLAYER_MOVED_EVENT,
          payload: {
            playerId: event.playerId,
            fromTileIndex: event.fromTileIndex,
            toTileIndex: event.toTileIndex,
            passedStart: event.passedStart
          }
        }
      ];
    case "tile_resolved": {
      const summaryCode = resolveTileSummaryCode(event);

      return [
        {
          eventName: GAME_TILE_RESOLVED_EVENT,
          payload: {
            playerId: event.playerId,
            tileIndex: event.tileIndex,
            tileType: event.tileType,
            summaryCode,
            message: createTileResolvedMessage(roomState, event, summaryCode)
          }
        }
      ];
    }
    case "payment_applied": {
      const payload: GamePaymentAppliedEvent = {
        amount: event.amount,
        reason: event.reason
      };

      if (event.fromPlayerId !== null) {
        payload.fromPlayerId = event.fromPlayerId;
      }

      if (event.toPlayerId !== null) {
        payload.toPlayerId = event.toPlayerId;
      }

      return [
        {
          eventName: GAME_PAYMENT_APPLIED_EVENT,
          payload
        }
      ];
    }
    case "property_purchased":
      return [
        {
          eventName: GAME_PROPERTY_PURCHASED_EVENT,
          payload: {
            playerId: event.playerId,
            propertyId: event.propertyId,
            tileIndex: event.tileIndex,
            purchasePrice: event.purchasePrice
          }
        }
      ];
    case "player_eliminated":
      return [
        {
          eventName: GAME_PLAYER_ELIMINATED_EVENT,
          payload: {
            playerId: event.playerId,
            reason: event.reason
          }
        }
      ];
    case "match_ended":
      return [
        {
          eventName: GAME_RESULT_READY_EVENT,
          payload: {
            winnerPlayerId: event.winnerPlayerId,
            endReason: event.endReason,
            finishedAt: event.finishedAt
          }
        }
      ];
    case "jail_state_changed":
    case "turn_advanced":
    default:
      return [];
  }
}

export function syncMonopolyRoomMetadata(room: MonopolyRoom): void {
  room.metadata = {
    ...(room.metadata ?? {}),
    roomKind: "monopoly",
    status: room.state.status,
    playerCount: room.state.players.size
  };
}

export function broadcastEngineTransitionEvents(
  room: MonopolyRoom,
  transitionResult: EngineTransitionResult
): void {
  syncMonopolyRoomMetadata(room);

  for (const event of transitionResult.events) {
    const instructions = mapEngineEventToBroadcastInstructions(room.state, event);

    for (const instruction of instructions) {
      room.broadcast(instruction.eventName, instruction.payload, { afterNextPatch: true });
    }
  }
}
