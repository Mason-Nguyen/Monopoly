import type { PlayerId, TileIndex, TurnPhase } from "@monopoly/shared-types";
import type { EngineMatchState, EngineTurnState } from "../types/index.js";

const AWAIT_ROLL_PHASE: TurnPhase = "await_roll";
const AWAIT_OPTIONAL_ACTION_PHASE: TurnPhase = "await_optional_action";
const AWAIT_END_TURN_PHASE: TurnPhase = "await_end_turn";
const TURN_COMPLETE_PHASE: TurnPhase = "turn_complete";

export function getActivePlayersInTurnOrder(state: EngineMatchState): PlayerId[] {
  return state.turnOrder.filter((playerId) => {
    const player = state.players[playerId];

    return player !== undefined && !player.isBankrupt && !player.isAbandoned;
  });
}

export function getNextActivePlayerId(
  state: EngineMatchState,
  currentPlayerId: PlayerId
): PlayerId {
  const activePlayers = getActivePlayersInTurnOrder(state);

  if (activePlayers.length === 0) {
    throw new Error("Engine match state has no available active players.");
  }

  const currentIndex = activePlayers.indexOf(currentPlayerId);

  if (currentIndex === -1) {
    return activePlayers[0]!;
  }

  return activePlayers[(currentIndex + 1) % activePlayers.length]!;
}

export function createAwaitRollTurnState(
  currentTurn: EngineTurnState,
  activePlayerId: PlayerId
): EngineTurnState {
  return {
    turnNumber: currentTurn.turnNumber + 1,
    activePlayerId,
    phase: AWAIT_ROLL_PHASE,
    dice: null,
    currentTileIndex: null,
    canBuyCurrentProperty: false,
    awaitingInput: true
  };
}

export function createAwaitOptionalActionTurnState(
  currentTurn: EngineTurnState,
  tileIndex: TileIndex
): EngineTurnState {
  return {
    ...currentTurn,
    phase: AWAIT_OPTIONAL_ACTION_PHASE,
    currentTileIndex: tileIndex,
    canBuyCurrentProperty: true,
    awaitingInput: true
  };
}

export function createAwaitEndTurnState(
  currentTurn: EngineTurnState,
  tileIndex: TileIndex
): EngineTurnState {
  return {
    ...currentTurn,
    phase: AWAIT_END_TURN_PHASE,
    currentTileIndex: tileIndex,
    canBuyCurrentProperty: false,
    awaitingInput: true
  };
}

export function canEndTurn(phase: TurnPhase): boolean {
  return phase === AWAIT_END_TURN_PHASE || phase === TURN_COMPLETE_PHASE;
}
