import {
  CLASSIC_BOARD_CONFIG,
  MVP_MAX_PLAYERS,
  MVP_MIN_PLAYERS,
  MVP_STARTING_MONEY
} from "@monopoly/shared-config";
import type { LobbyJoinOptions, MatchJoinOptions, PlayerIdentity } from "@monopoly/shared-types";
import { createLobbyId, createMatchId } from "../lib/index.js";
import {
  BoardStateSchema,
  ConnectionStateSchema,
  JailStateSchema,
  LobbyPlayerStateSchema,
  LobbyRoomStateSchema,
  MatchPlayerStateSchema,
  MatchResultStateSchema,
  MonopolyRoomStateSchema,
  PropertyStateSchema,
  TileStateSchema,
  TurnStateSchema
} from "./index.js";

export interface LobbyRoomCreateOptions {
  lobbyId?: string;
  minPlayers?: number;
  maxPlayers?: number;
  hostPlayerId?: string;
}

export interface MonopolyRoomCreateOptions {
  matchId?: string;
  sourceLobbyId?: string;
  players?: PlayerIdentity[];
}

export function createLobbyPlayerState(options: LobbyJoinOptions, isHost: boolean): LobbyPlayerStateSchema {
  const player = new LobbyPlayerStateSchema();
  player.playerId = options.playerId;
  player.displayName = options.displayName;
  player.isHost = isHost;
  player.isReady = false;
  player.joinedAt = Date.now();
  return player;
}

export function createLobbyRoomState(options: LobbyRoomCreateOptions = {}): LobbyRoomStateSchema {
  const state = new LobbyRoomStateSchema();
  state.lobbyId = options.lobbyId ?? createLobbyId();
  state.status = "waiting";
  state.hostPlayerId = options.hostPlayerId ?? "";
  state.minPlayers = options.minPlayers ?? MVP_MIN_PLAYERS;
  state.maxPlayers = options.maxPlayers ?? MVP_MAX_PLAYERS;
  state.playerCount = 0;
  state.canStartMatch = false;
  state.createdAt = Date.now();
  return state;
}

export function createJailState(): JailStateSchema {
  return new JailStateSchema();
}

export function createConnectionState(): ConnectionStateSchema {
  return new ConnectionStateSchema();
}

export function createMatchPlayerState(identity: PlayerIdentity, turnOrder: number): MatchPlayerStateSchema {
  const player = new MatchPlayerStateSchema();
  player.playerId = identity.playerId;
  player.displayName = identity.displayName;
  player.turnOrder = turnOrder;
  player.position = 0;
  player.balance = MVP_STARTING_MONEY;
  player.isBankrupt = false;
  player.isAbandoned = false;
  player.jail = createJailState();
  player.connection = createConnectionState();
  return player;
}

export function createTileState(tile: (typeof CLASSIC_BOARD_CONFIG.tiles)[number]): TileStateSchema {
  const tileState = new TileStateSchema();
  tileState.tileIndex = tile.tileIndex;
  tileState.key = tile.key;
  tileState.name = tile.name;
  tileState.tileType = tile.tileType;
  tileState.propertyId = tile.propertyId ?? "";
  tileState.taxAmount = tile.taxAmount ?? 0;
  tileState.targetTileIndex = tile.targetTileIndex ?? -1;
  return tileState;
}

export function createPropertyState(property: (typeof CLASSIC_BOARD_CONFIG.properties)[number]): PropertyStateSchema {
  const propertyState = new PropertyStateSchema();
  propertyState.propertyId = property.propertyId;
  propertyState.tileIndex = property.tileIndex;
  propertyState.key = property.key;
  propertyState.name = property.name;
  propertyState.purchasePrice = property.purchasePrice;
  propertyState.rentAmount = property.rentAmount;
  propertyState.colorGroup = property.colorGroup ?? "";
  propertyState.ownerPlayerId = "";
  return propertyState;
}

export function createBoardState(): BoardStateSchema {
  const board = new BoardStateSchema();
  board.boardId = CLASSIC_BOARD_CONFIG.boardId;
  board.tileCount = CLASSIC_BOARD_CONFIG.tileCount;

  for (const tile of CLASSIC_BOARD_CONFIG.tiles) {
    board.tiles.push(createTileState(tile));
  }

  for (const property of CLASSIC_BOARD_CONFIG.properties) {
    board.properties.set(property.propertyId, createPropertyState(property));
  }

  return board;
}

export function createTurnState(activePlayerId = ""): TurnStateSchema {
  const turn = new TurnStateSchema();
  turn.turnNumber = 1;
  turn.activePlayerId = activePlayerId;
  turn.phase = "await_roll";
  turn.diceTotal = 0;
  turn.diceValueA = 0;
  turn.diceValueB = 0;
  turn.currentTileIndex = -1;
  turn.canBuyCurrentProperty = false;
  turn.awaitingInput = activePlayerId !== "";
  return turn;
}

export function createEmptyResultState(): MatchResultStateSchema {
  return new MatchResultStateSchema();
}

export function createMonopolyRoomState(options: MonopolyRoomCreateOptions = {}): MonopolyRoomStateSchema {
  const state = new MonopolyRoomStateSchema();
  const players = options.players ?? [];

  state.matchId = options.matchId ?? createMatchId();
  state.sourceLobbyId = options.sourceLobbyId ?? "";
  state.status = "playing";
  state.startedAt = Date.now();
  state.finishedAt = 0;
  state.board = createBoardState();

  players.forEach((playerIdentity, index) => {
    state.players.set(playerIdentity.playerId, createMatchPlayerState(playerIdentity, index));
  });

  const firstPlayerId = players[0]?.playerId ?? "";
  state.turn = createTurnState(firstPlayerId);
  state.result = createEmptyResultState();
  return state;
}

export function createMatchPlayerFromJoinOptions(options: MatchJoinOptions, turnOrder: number): MatchPlayerStateSchema {
  return createMatchPlayerState(
    {
      playerId: options.playerId,
      displayName: options.playerId,
      isGuest: true
    },
    turnOrder
  );
}