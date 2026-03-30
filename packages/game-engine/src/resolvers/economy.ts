import type { BoardConfig, PlayerId, PropertyId } from "@monopoly/shared-types";
import type {
  EngineEvent,
  EngineMatchState,
  EnginePaymentAppliedEvent,
  EnginePlayerState,
  EnginePropertyPurchasedEvent
} from "../types/index.js";
import { EngineRuleError } from "../rules/errors.js";
import { eliminatePlayer } from "./elimination.js";
import { getPropertyConfigOrThrow } from "./board.js";

export interface MandatoryPaymentResolution {
  events: EngineEvent[];
  wasPayerEliminated: boolean;
}

function assertPositiveIntegerAmount(amount: number, label: string): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new EngineRuleError(`${label} must be a positive integer.`);
  }
}

function getPlayerOrThrow(
  state: EngineMatchState,
  playerId: PlayerId,
  label: string
): EnginePlayerState {
  const player = state.players[playerId];

  if (!player) {
    throw new EngineRuleError(`${label} was not found in engine state.`);
  }

  return player;
}

export function resolveMandatoryBankPayment(
  state: EngineMatchState,
  playerId: PlayerId,
  amount: number,
  reason: "tax"
): MandatoryPaymentResolution {
  assertPositiveIntegerAmount(amount, "Mandatory bank payment amount");

  const player = getPlayerOrThrow(state, playerId, "Mandatory-payment player");

  if (player.balance < amount) {
    return {
      events: [eliminatePlayer(state, playerId, "bankrupt")],
      wasPayerEliminated: true
    };
  }

  player.balance -= amount;

  const paymentEvent: EnginePaymentAppliedEvent = {
    type: "payment_applied",
    reason,
    amount,
    fromPlayerId: playerId,
    toPlayerId: null
  };

  return {
    events: [paymentEvent],
    wasPayerEliminated: false
  };
}

export function resolveMandatoryPlayerPayment(
  state: EngineMatchState,
  fromPlayerId: PlayerId,
  toPlayerId: PlayerId,
  amount: number,
  reason: "rent"
): MandatoryPaymentResolution {
  assertPositiveIntegerAmount(amount, "Mandatory player payment amount");

  const payer = getPlayerOrThrow(state, fromPlayerId, "Rent-paying player");
  const receiver = getPlayerOrThrow(state, toPlayerId, "Rent-receiving player");

  if (payer.balance < amount) {
    return {
      events: [eliminatePlayer(state, fromPlayerId, "bankrupt")],
      wasPayerEliminated: true
    };
  }

  payer.balance -= amount;
  receiver.balance += amount;

  const paymentEvent: EnginePaymentAppliedEvent = {
    type: "payment_applied",
    reason,
    amount,
    fromPlayerId,
    toPlayerId
  };

  return {
    events: [paymentEvent],
    wasPayerEliminated: false
  };
}

export function purchasePropertyOrThrow(
  state: EngineMatchState,
  boardConfig: BoardConfig,
  playerId: PlayerId,
  propertyId: PropertyId
): {
  paymentEvent: EnginePaymentAppliedEvent;
  purchaseEvent: EnginePropertyPurchasedEvent;
} {
  const player = getPlayerOrThrow(state, playerId, "Property-purchasing player");
  const propertyConfig = getPropertyConfigOrThrow(boardConfig, propertyId);
  const ownership = state.propertyOwners[propertyId];

  if (!ownership) {
    throw new EngineRuleError(`Property ownership state is missing for ${propertyId}.`);
  }

  if (ownership.ownerPlayerId !== null) {
    throw new EngineRuleError("The requested property is already owned.");
  }

  if (player.balance < propertyConfig.purchasePrice) {
    throw new EngineRuleError("Active player cannot afford this property purchase.");
  }

  player.balance -= propertyConfig.purchasePrice;
  ownership.ownerPlayerId = playerId;

  if (!player.ownedPropertyIds.includes(propertyId)) {
    player.ownedPropertyIds.push(propertyId);
  }

  return {
    paymentEvent: {
      type: "payment_applied",
      reason: "property_purchase",
      amount: propertyConfig.purchasePrice,
      fromPlayerId: playerId,
      toPlayerId: null
    },
    purchaseEvent: {
      type: "property_purchased",
      playerId,
      propertyId,
      purchasePrice: propertyConfig.purchasePrice,
      tileIndex: propertyConfig.tileIndex
    }
  };
}
