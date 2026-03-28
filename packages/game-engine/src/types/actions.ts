import type { PlayerId, PropertyId } from "@monopoly/shared-types";

export const ENGINE_ACTION_TYPES = [
  "roll_dice",
  "buy_property",
  "end_turn"
] as const;

export type EngineActionType = (typeof ENGINE_ACTION_TYPES)[number];

export interface EngineDiceValues {
  valueA: number;
  valueB: number;
}

export interface EngineDiceRoll extends EngineDiceValues {
  total: number;
}

export interface EngineDiceSource {
  rollDice(): EngineDiceValues;
}

export interface EngineRollDiceAction {
  type: "roll_dice";
  actingPlayerId: PlayerId;
  diceValues?: EngineDiceValues;
}

export interface EngineBuyPropertyAction {
  type: "buy_property";
  actingPlayerId: PlayerId;
  propertyId: PropertyId;
}

export interface EngineEndTurnAction {
  type: "end_turn";
  actingPlayerId: PlayerId;
}

export type EngineAction =
  | EngineRollDiceAction
  | EngineBuyPropertyAction
  | EngineEndTurnAction;