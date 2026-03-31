import { getActivePlayersInTurnOrder } from "../reducers/turn.js";
import { EngineRuleError } from "../rules/errors.js";
function getPlayerOrThrow(state, playerId) {
    const player = state.players[playerId];
    if (!player) {
        throw new EngineRuleError(`Engine player ${playerId} was not found.`);
    }
    return player;
}
function deriveMatchEndReason(state, winnerPlayerId) {
    const otherPlayers = state.turnOrder
        .filter((playerId) => playerId !== winnerPlayerId)
        .map((playerId) => getPlayerOrThrow(state, playerId));
    if (otherPlayers.length > 0 && otherPlayers.every((player) => player.isBankrupt)) {
        return "all_others_bankrupt";
    }
    if (otherPlayers.length > 0 && otherPlayers.every((player) => player.isAbandoned)) {
        return "all_others_abandoned";
    }
    return "last_player_remaining";
}
export function eliminatePlayer(state, playerId, reason) {
    const player = getPlayerOrThrow(state, playerId);
    const releasedPropertyIds = [...player.ownedPropertyIds];
    for (const propertyId of releasedPropertyIds) {
        const ownership = state.propertyOwners[propertyId];
        if (!ownership) {
            throw new EngineRuleError(`Property ownership state is missing for released property ${propertyId}.`);
        }
        ownership.ownerPlayerId = null;
    }
    player.ownedPropertyIds = [];
    player.balance = 0;
    player.jail = {
        isInJail: false,
        turnsRemaining: 0
    };
    player.eliminationReason = reason;
    player.isBankrupt = reason === "bankrupt";
    player.isAbandoned = reason === "abandoned";
    return {
        type: "player_eliminated",
        playerId,
        reason,
        releasedPropertyIds
    };
}
export function finishMatchIfSinglePlayerRemaining(state, now) {
    const activePlayerIds = getActivePlayersInTurnOrder(state);
    if (activePlayerIds.length > 1) {
        return null;
    }
    const winnerPlayerId = activePlayerIds[0];
    if (!winnerPlayerId) {
        throw new EngineRuleError("Engine match cannot finish without an active winner.");
    }
    const endReason = deriveMatchEndReason(state, winnerPlayerId);
    state.status = "finished";
    state.finishedAt = now;
    state.result = {
        winnerPlayerId,
        endReason,
        finishedAt: now
    };
    state.turn = {
        ...state.turn,
        activePlayerId: winnerPlayerId,
        phase: "turn_complete",
        dice: null,
        currentTileIndex: null,
        canBuyCurrentProperty: false,
        awaitingInput: false
    };
    return {
        type: "match_ended",
        winnerPlayerId,
        endReason,
        finishedAt: now
    };
}
