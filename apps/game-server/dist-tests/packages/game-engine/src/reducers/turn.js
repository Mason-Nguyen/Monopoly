const AWAIT_ROLL_PHASE = "await_roll";
const AWAIT_OPTIONAL_ACTION_PHASE = "await_optional_action";
const AWAIT_END_TURN_PHASE = "await_end_turn";
const TURN_COMPLETE_PHASE = "turn_complete";
export function getActivePlayersInTurnOrder(state) {
    return state.turnOrder.filter((playerId) => {
        const player = state.players[playerId];
        return player !== undefined && !player.isBankrupt && !player.isAbandoned;
    });
}
export function getNextActivePlayerId(state, currentPlayerId) {
    const activePlayers = getActivePlayersInTurnOrder(state);
    if (activePlayers.length === 0) {
        throw new Error("Engine match state has no available active players.");
    }
    const currentIndex = activePlayers.indexOf(currentPlayerId);
    if (currentIndex === -1) {
        return activePlayers[0];
    }
    return activePlayers[(currentIndex + 1) % activePlayers.length];
}
export function createAwaitRollTurnState(currentTurn, activePlayerId) {
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
export function createAwaitOptionalActionTurnState(currentTurn, tileIndex) {
    return {
        ...currentTurn,
        phase: AWAIT_OPTIONAL_ACTION_PHASE,
        currentTileIndex: tileIndex,
        canBuyCurrentProperty: true,
        awaitingInput: true
    };
}
export function createAwaitEndTurnState(currentTurn, tileIndex) {
    return {
        ...currentTurn,
        phase: AWAIT_END_TURN_PHASE,
        currentTileIndex: tileIndex,
        canBuyCurrentProperty: false,
        awaitingInput: true
    };
}
export function canEndTurn(phase) {
    return phase === AWAIT_END_TURN_PHASE || phase === TURN_COMPLETE_PHASE;
}
