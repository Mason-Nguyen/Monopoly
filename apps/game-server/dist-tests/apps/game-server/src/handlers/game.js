import { GAME_BUY_PROPERTY_COMMAND, GAME_END_TURN_COMMAND, GAME_ERROR_EVENT, GAME_ROLL_DICE_COMMAND } from "@monopoly/shared-types";
import { EngineRuleError } from "@monopoly/game-engine";
import { executeEngineActionForMonopolyRoomState, processMonopolyRoomTransition, syncIdleTurnTimeout } from "../services/index.js";
function getPlayerIdFromClient(client) {
    return String(client.userData?.playerId ?? "");
}
function sendGameError(client, code, message) {
    client.send(GAME_ERROR_EVENT, { code, message });
}
function assertRegisteredPlayer(room, client) {
    const playerId = getPlayerIdFromClient(client);
    if (playerId === "" || !room.state.players.has(playerId)) {
        sendGameError(client, "INVALID_PAYLOAD", "Player is not registered in this match room.");
        return null;
    }
    return playerId;
}
function mapEngineRuleErrorCode(error) {
    const message = error.message;
    if (message.includes("Only the active player")) {
        return "NOT_ACTIVE_PLAYER";
    }
    if (message.includes("Eliminated players cannot perform engine actions")) {
        return "PLAYER_ELIMINATED";
    }
    if (message.includes("not in a playable state")) {
        return "MATCH_NOT_PLAYING";
    }
    if (message.includes("does not allow ending the turn") ||
        message.includes("not waiting for a dice roll") ||
        message.includes("not waiting for an optional property purchase") ||
        message.includes("does not have a resolved tile index")) {
        return "INVALID_TURN_PHASE";
    }
    if (message.includes("cannot afford this property purchase")) {
        return "INSUFFICIENT_FUNDS";
    }
    if (message.includes("not a purchasable property tile") ||
        message.includes("does not match the current engine tile") ||
        message.includes("already owned")) {
        return "PROPERTY_NOT_BUYABLE";
    }
    return "INVALID_PAYLOAD";
}
function executeOrSendGameError(room, client, actionFactory) {
    const playerId = assertRegisteredPlayer(room, client);
    if (!playerId) {
        return;
    }
    try {
        const now = Date.now();
        const result = executeEngineActionForMonopolyRoomState(room.state, actionFactory(playerId), {
            now
        });
        processMonopolyRoomTransition(room, result, { now });
        syncIdleTurnTimeout(room);
    }
    catch (error) {
        if (error instanceof EngineRuleError) {
            sendGameError(client, mapEngineRuleErrorCode(error), error.message);
            return;
        }
        throw error;
    }
}
export function createGameMessageHandlers(room) {
    return {
        [GAME_ROLL_DICE_COMMAND]: (client) => {
            executeOrSendGameError(room, client, (playerId) => ({
                type: "roll_dice",
                actingPlayerId: playerId
            }));
        },
        [GAME_BUY_PROPERTY_COMMAND]: (client, payload) => {
            if (typeof payload?.propertyId !== "string" || payload.propertyId.length === 0) {
                sendGameError(client, "INVALID_PAYLOAD", "A propertyId string is required.");
                return;
            }
            executeOrSendGameError(room, client, (playerId) => ({
                type: "buy_property",
                actingPlayerId: playerId,
                propertyId: payload.propertyId
            }));
        },
        [GAME_END_TURN_COMMAND]: (client) => {
            executeOrSendGameError(room, client, (playerId) => ({
                type: "end_turn",
                actingPlayerId: playerId
            }));
        }
    };
}
