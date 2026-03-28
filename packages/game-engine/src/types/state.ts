import type { BoardConfig } from "@monopoly/shared-types";
import type {
  BoardId,
  MatchId,
  PlayerId,
  PropertyId,
  TileIndex,
  UnixTimestampMs,
  Dictionary,
  Nullable,
  EliminationReason,
  MatchEndReason,
  MatchStatus,
  TurnPhase
} from "@monopoly/shared-types";
import type { EngineDiceRoll } from "./actions.js";

export interface EngineJailState {
  isInJail: boolean;
  turnsRemaining: number;
}

export interface EnginePlayerState {
  playerId: PlayerId;
  displayName: string;
  turnOrder: number;
  position: TileIndex;
  balance: number;
  ownedPropertyIds: PropertyId[];
  isBankrupt: boolean;
  isAbandoned: boolean;
  eliminationReason: Nullable<EliminationReason>;
  jail: EngineJailState;
}

export interface EnginePropertyOwnershipState {
  propertyId: PropertyId;
  ownerPlayerId: Nullable<PlayerId>;
}

export interface EngineTurnState {
  turnNumber: number;
  activePlayerId: PlayerId;
  phase: TurnPhase;
  dice: Nullable<EngineDiceRoll>;
  currentTileIndex: Nullable<TileIndex>;
  canBuyCurrentProperty: boolean;
  awaitingInput: boolean;
}

export interface EngineMatchResultState {
  winnerPlayerId: PlayerId;
  endReason: MatchEndReason;
  finishedAt: UnixTimestampMs;
}

export interface EngineMatchState {
  matchId: MatchId;
  boardId: BoardId;
  status: MatchStatus;
  startedAt: UnixTimestampMs;
  finishedAt: Nullable<UnixTimestampMs>;
  players: Dictionary<PlayerId, EnginePlayerState>;
  turnOrder: PlayerId[];
  propertyOwners: Dictionary<PropertyId, EnginePropertyOwnershipState>;
  turn: EngineTurnState;
  result: Nullable<EngineMatchResultState>;
}

export interface EnginePlayerSetup {
  playerId: PlayerId;
  displayName: string;
  turnOrder: number;
}

export interface CreateEngineMatchInput {
  matchId: MatchId;
  boardConfig: BoardConfig;
  players: EnginePlayerSetup[];
  startedAt: UnixTimestampMs;
}