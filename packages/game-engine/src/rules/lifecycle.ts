import { cloneMatchState } from "../reducers/match-state.js";
import {
  advanceToNextPlayableTurn,
  eliminatePlayer,
  finishMatchIfSinglePlayerRemaining
} from "../resolvers/index.js";
import type {
  EngineLifecycleTransitionInput,
  EngineTransitionResult
} from "../types/index.js";
import { getAvailableActions } from "./available-actions.js";
import { EngineRuleError } from "./errors.js";

function assertBoardMatchesState(input: EngineLifecycleTransitionInput): void {
  if (input.state.boardId !== input.boardConfig.boardId) {
    throw new EngineRuleError("Engine state board ID does not match the provided board config.");
  }
}

function applyAbandonPlayerOutcome(
  input: EngineLifecycleTransitionInput
): EngineTransitionResult {
  const { state, outcome, now } = input;

  if (state.status !== "playing") {
    throw new EngineRuleError("Engine match is not in a playable state.");
  }

  const existingPlayer = state.players[outcome.playerId];

  if (!existingPlayer) {
    throw new EngineRuleError(`Engine player ${outcome.playerId} was not found.`);
  }

  const nextState = cloneMatchState(state);
  const nextPlayer = nextState.players[outcome.playerId];

  if (!nextPlayer) {
    throw new EngineRuleError(`Engine player ${outcome.playerId} was not found.`);
  }

  if (nextPlayer.isAbandoned || nextPlayer.isBankrupt) {
    return {
      state: nextState,
      events: [],
      availableActions: getAvailableActions(nextState),
      turnCompleted: false
    };
  }

  const events: EngineTransitionResult["events"] = [
    eliminatePlayer(nextState, outcome.playerId, outcome.reason)
  ];

  let turnCompleted = false;

  if (state.turn.activePlayerId === outcome.playerId) {
    events.push(...advanceToNextPlayableTurn(nextState, outcome.playerId, now));
    turnCompleted = true;
  } else {
    const matchEndedEvent = finishMatchIfSinglePlayerRemaining(nextState, now);

    if (matchEndedEvent) {
      events.push(matchEndedEvent);
      turnCompleted = true;
    }
  }

  return {
    state: nextState,
    events,
    availableActions: getAvailableActions(nextState),
    turnCompleted
  };
}

export function applyEngineLifecycleOutcome(
  input: EngineLifecycleTransitionInput
): EngineTransitionResult {
  assertBoardMatchesState(input);

  switch (input.outcome.type) {
    case "abandon_player":
      return applyAbandonPlayerOutcome(input);
    default:
      throw new EngineRuleError("Unsupported engine lifecycle outcome.");
  }
}
