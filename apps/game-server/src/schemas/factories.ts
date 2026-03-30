import {
  CLASSIC_BOARD_CONFIG,
  MVP_MAX_PLAYERS,
  MVP_MIN_PLAYERS,
  MVP_STARTING_MONEY
} from "@monopoly/shared-config";
import type {
  ConnectionStatus,
  LobbyJoinOptions,
  MatchJoinOptions,
  PlayerIdentity
} from "@monopoly/shared-types";
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
  startedAt?: number;
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

export function createConnectionState(status: ConnectionStatus = "connected"): ConnectionStateSchema {
  const connection = new ConnectionStateSchema();
  connection.status = status;
  connection.reconnectDeadlineAt = 0;
  return connection;
}

export function createMatchPlayerState(
  identity: PlayerIdentity,
  turnOrder: number,
  connectionStatus: ConnectionStatus = "connected"
): MatchPlayerStateSchema {
  const player = new MatchPlayerStateSchema();
  player.playerId = identity.playerId;
  player.displayName = identity.displayName;
  player.turnOrder = turnOrder;
  player.position = 0;
  player.balance = MVP_STARTING_MONEY;
  player.isBankrupt = false;
  player.isAbandoned = false;
  player.jail = createJailState();
  player.connection = createConnectionState(connectionStatus);
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

export function createEmptyMonopolyRoomState(
  options: MonopolyRoomCreateOptions = {}
): MonopolyRoomStateSchema {
  const state = new MonopolyRoomStateSchema();

  state.matchId = options.matchId ?? createMatchId();
  state.sourceLobbyId = options.sourceLobbyId ?? "";
  state.status = "playing";
  state.startedAt = options.startedAt ?? Date.now();
  state.finishedAt = 0;
  state.board = createBoardState();
  state.turn = createTurnState();
  state.result = createEmptyResultState();
  return state;
}

export function createMonopolyRoomState(options: MonopolyRoomCreateOptions = {}): MonopolyRoomStateSchema {
  const state = createEmptyMonopolyRoomState(options);
  const players = options.players ?? [];

  players.forEach((playerIdentity, index) => {
    state.players.set(
      playerIdentity.playerId,
      createMatchPlayerState(playerIdentity, index + 1, "disconnected_reserved")
    );
  });

  const firstPlayerId = players[0]?.playerId ?? "";
  state.turn = createTurnState(firstPlayerId);
  return state;
}

export function createMatchPlayerFromJoinOptions(
  options: MatchJoinOptions,
  turnOrder: number
): MatchPlayerStateSchema {
  return createMatchPlayerState(
    {
      playerId: options.playerId,
      displayName: options.playerId,
      isGuest: true
    },
    turnOrder,
    "connected"
  );
}
