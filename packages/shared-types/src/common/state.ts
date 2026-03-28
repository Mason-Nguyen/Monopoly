import type {
  BoardId,
  LobbyId,
  MatchId,
  PlayerId,
  PropertyId,
  TileIndex,
  UnixTimestampMs
} from "../ids/index.js";
import type {
  ConnectionStatus,
  LobbyStatus,
  MatchEndReason,
  MatchStatus,
  TurnPhase
} from "../enums/index.js";
import type { BoardConfig, PropertyConfig, TileConfig } from "../board/index.js";
import type { Dictionary, Nullable } from "./primitives.js";

export interface LobbyPlayerState {
  playerId: PlayerId;
  displayName: string;
  isHost: boolean;
  isReady: boolean;
  joinedAt: UnixTimestampMs;
}

export interface LobbyRoomState {
  lobbyId: LobbyId;
  status: LobbyStatus;
  hostPlayerId: PlayerId;
  minPlayers: number;
  maxPlayers: number;
  playerCount: number;
  players: Dictionary<PlayerId, LobbyPlayerState>;
  canStartMatch: boolean;
  createdAt: UnixTimestampMs;
}

export interface JailState {
  isInJail: boolean;
  turnsRemaining: number;
}

export interface ConnectionState {
  status: ConnectionStatus;
  reconnectDeadlineAt?: UnixTimestampMs;
}

export interface MatchPlayerState {
  playerId: PlayerId;
  displayName: string;
  turnOrder: number;
  position: TileIndex;
  balance: number;
  isBankrupt: boolean;
  isAbandoned: boolean;
  jail: JailState;
  connection: ConnectionState;
}

export interface PropertyState extends PropertyConfig {
  ownerPlayerId: Nullable<PlayerId>;
}

export interface BoardState {
  boardId: BoardId;
  tileCount: number;
  tiles: TileConfig[];
  properties: Dictionary<PropertyId, PropertyState>;
}

export interface TurnState {
  turnNumber: number;
  activePlayerId: PlayerId;
  phase: TurnPhase;
  diceTotal: number;
  diceValueA: number;
  diceValueB: number;
  currentTileIndex: Nullable<TileIndex>;
  canBuyCurrentProperty: boolean;
  awaitingInput: boolean;
}

export interface MatchResultState {
  winnerPlayerId: PlayerId;
  endReason: MatchEndReason;
  finishedAt: UnixTimestampMs;
}

export interface MonopolyRoomState {
  matchId: MatchId;
  sourceLobbyId: Nullable<LobbyId>;
  status: MatchStatus;
  startedAt: UnixTimestampMs;
  finishedAt: Nullable<UnixTimestampMs>;
  players: Dictionary<PlayerId, MatchPlayerState>;
  board: BoardState;
  turn: TurnState;
  result: Nullable<MatchResultState>;
}

export interface MatchInitializationSnapshot {
  boardConfig: BoardConfig;
  players: MatchPlayerState[];
}