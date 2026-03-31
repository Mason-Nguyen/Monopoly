import { EngineRuleError } from "@monopoly/game-engine";
import { MVP_IDLE_TURN_TIMEOUT_MS } from "@monopoly/shared-config";
import { executeEngineActionForMonopolyRoomState } from "./engine-command-execution.js";
import { processMonopolyRoomTransition } from "./completed-match-persistence.js";
function clearIdleTurnTimeout(room) {
    room.idleTurnTimeout?.clear();
    room.idleTurnTimeout = null;
    room.idleTurnTimeoutContext = null;
}
function getIdleEligibleContext(room) {
    if (room.state.status !== "playing") {
        return null;
    }
    const { turn } = room.state;
    if (!turn.awaitingInput) {
        return null;
    }
    if (turn.phase !== "await_roll" &&
        turn.phase !== "await_optional_action" &&
        turn.phase !== "await_end_turn") {
        return null;
    }
    const player = room.state.players.get(turn.activePlayerId);
    if (!player || player.isBankrupt || player.isAbandoned) {
        return null;
    }
    if (player.connection.status !== "connected" && player.connection.status !== "reconnected") {
        return null;
    }
    return {
        playerId: turn.activePlayerId,
        phase: turn.phase,
        turnNumber: turn.turnNumber
    };
}
function isMatchingIdleContext(room, context) {
    return (room.state.status === "playing" &&
        room.state.turn.activePlayerId === context.playerId &&
        room.state.turn.phase === context.phase &&
        room.state.turn.turnNumber === context.turnNumber);
}
function handleIdleTurnTimeout(room, context) {
    room.idleTurnTimeout = null;
    room.idleTurnTimeoutContext = null;
    if (!isMatchingIdleContext(room, context)) {
        syncIdleTurnTimeout(room);
        return;
    }
    try {
        const now = Date.now();
        const result = (() => {
            switch (context.phase) {
                case "await_roll":
                    return executeEngineActionForMonopolyRoomState(room.state, {
                        type: "roll_dice",
                        actingPlayerId: context.playerId
                    }, { now });
                case "await_optional_action":
                    return executeEngineActionForMonopolyRoomState(room.state, {
                        type: "skip_optional_action",
                        actingPlayerId: context.playerId
                    }, { now });
                case "await_end_turn":
                    return executeEngineActionForMonopolyRoomState(room.state, {
                        type: "end_turn",
                        actingPlayerId: context.playerId
                    }, { now });
                default:
                    return null;
            }
        })();
        if (result) {
            processMonopolyRoomTransition(room, result, { now });
        }
    }
    catch (error) {
        if (!(error instanceof EngineRuleError)) {
            throw error;
        }
    }
    syncIdleTurnTimeout(room);
}
export function syncIdleTurnTimeout(room) {
    clearIdleTurnTimeout(room);
    const context = getIdleEligibleContext(room);
    if (!context) {
        return;
    }
    room.idleTurnTimeoutContext = context;
    room.idleTurnTimeout = room.clock.setTimeout(() => handleIdleTurnTimeout(room, context), MVP_IDLE_TURN_TIMEOUT_MS);
}
export function cancelIdleTurnTimeout(room) {
    clearIdleTurnTimeout(room);
}
