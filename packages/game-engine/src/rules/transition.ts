import type { BoardConfig } from "@monopoly/shared-types";
import { calculateMovement } from "../calculators/movement.js";
import { resolveDiceRoll } from "../calculators/dice.js";
import { cloneMatchState, createInitialMatchState } from "../reducers/match-state.js";
import {
  canEndTurn,
  createAwaitRollTurnState,
  getNextActivePlayerId
} from "../reducers/turn.js";
import type {
  EngineTransitionInput,
  EngineTransitionResult,
  CreateEngineMatchInput,
  EngineAction,
  EngineMatchState,
  EnginePaymentAppliedEvent,
  EnginePlayerMovedEvent,
  EngineTurnAdvancedEvent
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
  const { state, boardConfig, action, diceSource } = input;

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

  return {
    state: nextState,
    events,
    availableActions: getAvailableActions(nextState),
    turnCompleted: false
  };
}

function applyEndTurnTransition(
  input: EngineTransitionInput
): EngineTransitionResult {
  const { state, action } = input;

  if (action.type !== "end_turn") {
    throw new EngineRuleError("Invalid engine action passed to end-turn transition.");
  }

  if (!canEndTurn(state.turn.phase)) {
    throw new EngineRuleError("The current engine turn phase does not allow ending the turn.");
  }

  const nextState = cloneMatchState(state);
  const nextActivePlayerId = getNextActivePlayerId(nextState, action.actingPlayerId);

  nextState.turn = createAwaitRollTurnState(nextState.turn, nextActivePlayerId);

  const turnAdvancedEvent: EngineTurnAdvancedEvent = {
    type: "turn_advanced",
    fromPlayerId: action.actingPlayerId,
    toPlayerId: nextActivePlayerId,
    turnNumber: nextState.turn.turnNumber
  };

  return {
    state: nextState,
    events: [turnAdvancedEvent],
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
    case "end_turn":
      return applyEndTurnTransition(input);
    case "buy_property":
      throw new EngineRuleError(
        "Property purchase resolution is not implemented until Phase 6 Step 4."
      );
    default:
      throw new EngineRuleError("Unsupported engine action.");
  }
}

export { createInitialMatchState };