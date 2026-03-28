import type {
  PlayerId,
  PropertyId,
  TileIndex,
  UnixTimestampMs,
  EliminationReason,
  MatchEndReason,
  PaymentReason,
  TileType,
  Nullable,
  BoardConfig
} from "@monopoly/shared-types";
import type {
  EngineActionType,
  EngineAction,
  EngineDiceRoll,
  EngineDiceSource
} from "./actions.js";
import type { EngineMatchState } from "./state.js";

export const ENGINE_EVENT_TYPES = [
  "dice_rolled",
  "player_moved",
  "tile_resolved",
  "payment_applied",
  "property_purchased",
  "jail_state_changed",
  "player_eliminated",
  "turn_advanced",
  "match_ended"
] as const;

export type EngineEventType = (typeof ENGINE_EVENT_TYPES)[number];

export interface EngineDiceRolledEvent {
  type: "dice_rolled";
  playerId: PlayerId;
  dice: EngineDiceRoll;
}

export interface EnginePlayerMovedEvent {
  type: "player_moved";
  playerId: PlayerId;
  fromTileIndex: TileIndex;
  toTileIndex: TileIndex;
  passedStart: boolean;
}

export interface EngineTileResolvedEvent {
  type: "tile_resolved";
  playerId: PlayerId;
  tileIndex: TileIndex;
  tileType: TileType;
  propertyId?: PropertyId;
  ownerPlayerId?: Nullable<PlayerId>;
  taxAmount?: number;
}

export interface EnginePaymentAppliedEvent {
  type: "payment_applied";
  reason: PaymentReason;
  amount: number;
  fromPlayerId: Nullable<PlayerId>;
  toPlayerId: Nullable<PlayerId>;
}

export interface EnginePropertyPurchasedEvent {
  type: "property_purchased";
  playerId: PlayerId;
  propertyId: PropertyId;
  purchasePrice: number;
  tileIndex: TileIndex;
}

export interface EngineJailStateChangedEvent {
  type: "jail_state_changed";
  playerId: PlayerId;
  isInJail: boolean;
  turnsRemaining: number;
}

export interface EnginePlayerEliminatedEvent {
  type: "player_eliminated";
  playerId: PlayerId;
  reason: EliminationReason;
  releasedPropertyIds: PropertyId[];
}

export interface EngineTurnAdvancedEvent {
  type: "turn_advanced";
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
  turnNumber: number;
}

export interface EngineMatchEndedEvent {
  type: "match_ended";
  winnerPlayerId: PlayerId;
  endReason: MatchEndReason;
  finishedAt: UnixTimestampMs;
}

export type EngineEvent =
  | EngineDiceRolledEvent
  | EnginePlayerMovedEvent
  | EngineTileResolvedEvent
  | EnginePaymentAppliedEvent
  | EnginePropertyPurchasedEvent
  | EngineJailStateChangedEvent
  | EnginePlayerEliminatedEvent
  | EngineTurnAdvancedEvent
  | EngineMatchEndedEvent;

export interface EngineTransitionInput {
  state: EngineMatchState;
  boardConfig: BoardConfig;
  action: EngineAction;
  now: UnixTimestampMs;
  diceSource?: EngineDiceSource;
}

export interface EngineTransitionResult {
  state: EngineMatchState;
  events: EngineEvent[];
  availableActions: EngineActionType[];
  turnCompleted: boolean;
}