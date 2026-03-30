import type { BoardConfig } from "@monopoly/shared-types";
import { calculateMovement } from "../calculators/movement.js";
import { resolveDiceRoll } from "../calculators/dice.js";
import { cloneMatchState, createInitialMatchState } from "../reducers/match-state.js";
import {
  canEndTurn,
  createAwaitEndTurnState
} from "../reducers/turn.js";
import {
  advanceToNextPlayableTurn,
  getTileConfigOrThrow,
  purchasePropertyOrThrow,
  resolveActivePlayerTile
} from "../resolvers/index.js";
import type {
  EngineTransitionInput,
  EngineTransitionResult,
  EngineAction,
  EngineMatchState,
  EnginePaymentAppliedEvent,
  EnginePlayerMovedEvent
} from "../types/index.js";
import { getAvailableActions } from "./available-actions.js";
import { EngineRuleError } from "./errors.js";

function assertBoardMatchesState(
  state: EngineMatchState,
  boardConfig: BoardConfig
): void {
  if (state.boardId !== boardConfig.boardId) {
    throw new EngineRuleError("Engine state board ID does not match the provided board config.");
  }
}

function assertActiveAction(state: EngineMatchState, action: EngineAction): void {
  if (state.status !== "playing") {
    throw new EngineRuleError("Engine match is not in a playable state.");
  }

  if (action.actingPlayerId !== state.turn.activePlayerId) {
    throw new EngineRuleError("Only the active player may perform engine actions.");
  }

  const activePlayer = state.players[action.actingPlayerId];

  if (!activePlayer) {
    throw new EngineRuleError("Active player was not found in engine state.");
  }

  if (activePlayer.isBankrupt || activePlayer.isAbandoned) {
    throw new EngineRuleError("Eliminated players cannot perform engine actions.");
  }
}

function applyRollDiceTransition(
  input: EngineTransitionInput
): EngineTransitionResult {
  const { state, boardConfig, action, diceSource, now } = input;

  if (action.type !== "roll_dice") {
    throw new EngineRuleError("Invalid engine action passed to roll-dice transition.");
  }

  if (state.turn.phase !== "await_roll") {
    throw new EngineRuleError("The engine is not waiting for a dice roll.");
  }

  const nextState = cloneMatchState(state);
  const activePlayer = nextState.players[action.actingPlayerId];

  if (!activePlayer) {
    throw new EngineRuleError("Active player was not found in engine state.");
  }

  const dice = resolveDiceRoll(action.diceValues, diceSource);
  const movement = calculateMovement(boardConfig, activePlayer.position, dice.total);
  const events: EngineTransitionResult["events"] = [
    {
      type: "dice_rolled",
      playerId: activePlayer.playerId,
      dice
    }
  ];

  activePlayer.position = movement.toTileIndex;
  nextState.turn = {
    ...nextState.turn,
    phase: "resolving_tile",
    dice,
    currentTileIndex: movement.toTileIndex,
    canBuyCurrentProperty: false,
    awaitingInput: false
  };

  const movedEvent: EnginePlayerMovedEvent = {
    type: "player_moved",
    playerId: activePlayer.playerId,
    fromTileIndex: movement.fromTileIndex,
    toTileIndex: movement.toTileIndex,
    passedStart: movement.passedStart
  };

  events.push(movedEvent);

  if (movement.passedStart) {
    activePlayer.balance += boardConfig.startSalary;

    const salaryEvent: EnginePaymentAppliedEvent = {
      type: "payment_applied",
      reason: "start_salary",
      amount: boardConfig.startSalary,
      fromPlayerId: null,
      toPlayerId: activePlayer.playerId
    };

    events.push(salaryEvent);
  }

  const tileResolution = resolveActivePlayerTile(
    nextState,
    boardConfig,
    activePlayer.playerId
  );

  events.push(...tileResolution.events);

  if (tileResolution.activePlayerEliminated) {
    events.push(...advanceToNextPlayableTurn(nextState, activePlayer.playerId, now));

    return {
      state: nextState,
      events,
      availableActions: getAvailableActions(nextState),
      turnCompleted: true
    };
  }

  return {
    state: nextState,
    events,
    availableActions: getAvailableActions(nextState),
    turnCompleted: false
  };
}

function applyBuyPropertyTransition(
  input: EngineTransitionInput
): EngineTransitionResult {
  const { state, boardConfig, action } = input;

  if (action.type !== "buy_property") {
    throw new EngineRuleError("Invalid engine action passed to buy-property transition.");
  }

  if (state.turn.phase !== "await_optional_action" || !state.turn.canBuyCurrentProperty) {
    throw new EngineRuleError("The engine is not waiting for an optional property purchase.");
  }

  if (state.turn.currentTileIndex === null) {
    throw new EngineRuleError("The current engine turn does not have a resolved tile index.");
  }

  const currentTile = getTileConfigOrThrow(boardConfig, state.turn.currentTileIndex);

  if (currentTile.tileType !== "property" || !currentTile.propertyId) {
    throw new EngineRuleError("The current engine tile is not a purchasable property tile.");
  }

  if (currentTile.propertyId !== action.propertyId) {
    throw new EngineRuleError("The requested property does not match the current engine tile.");
  }

  const nextState = cloneMatchState(state);
  const purchaseResult = purchasePropertyOrThrow(
    nextState,
    boardConfig,
    action.actingPlayerId,
    action.propertyId
  );

  nextState.turn = createAwaitEndTurnState(nextState.turn, state.turn.currentTileIndex);

  return {
    state: nextState,
    events: [purchaseResult.paymentEvent, purchaseResult.purchaseEvent],
    availableActions: getAvailableActions(nextState),
    turnCompleted: false
  };
}

function applySkipOptionalActionTransition(
  input: EngineTransitionInput
): EngineTransitionResult {
  const { state, action } = input;

  if (action.type !== "skip_optional_action") {
    throw new EngineRuleError("Invalid engine action passed to skip-optional-action transition.");
  }

  if (state.turn.phase !== "await_optional_action") {
    throw new EngineRuleError("The engine is not waiting for an optional property purchase.");
  }

  if (state.turn.currentTileIndex === null) {
    throw new EngineRuleError("The current engine turn does not have a resolved tile index.");
  }

  const nextState = cloneMatchState(state);
  nextState.turn = createAwaitEndTurnState(nextState.turn, state.turn.currentTileIndex);

  return {
    state: nextState,
    events: [],
    availableActions: getAvailableActions(nextState),
    turnCompleted: false
  };
}

function applyEndTurnTransition(
  input: EngineTransitionInput
): EngineTransitionResult {
  const { state, action, now } = input;

  if (action.type !== "end_turn") {
    throw new EngineRuleError("Invalid engine action passed to end-turn transition.");
  }

  if (!canEndTurn(state.turn.phase)) {
    throw new EngineRuleError("The current engine turn phase does not allow ending the turn.");
  }

  const nextState = cloneMatchState(state);
  const events = advanceToNextPlayableTurn(nextState, action.actingPlayerId, now);

  return {
    state: nextState,
    events,
    availableActions: getAvailableActions(nextState),
    turnCompleted: true
  };
}

export function applyEngineAction(
  input: EngineTransitionInput
): EngineTransitionResult {
  assertBoardMatchesState(input.state, input.boardConfig);
  assertActiveAction(input.state, input.action);

  switch (input.action.type) {
    case "roll_dice":
      return applyRollDiceTransition(input);
    case "buy_property":
      return applyBuyPropertyTransition(input);
    case "skip_optional_action":
      return applySkipOptionalActionTransition(input);
    case "end_turn":
      return applyEndTurnTransition(input);
    default:
      throw new EngineRuleError("Unsupported engine action.");
  }
}

export { createInitialMatchState };
