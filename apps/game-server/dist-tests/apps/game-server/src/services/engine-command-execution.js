import { applyEngineAction } from "@monopoly/game-engine";
import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import { applyEngineStateToMonopolyRoomState, projectMonopolyRoomStateToEngineState } from "./engine-state-projection.js";
function createRuntimeDiceSource() {
    return {
        rollDice() {
            return {
                valueA: Math.floor(Math.random() * 6) + 1,
                valueB: Math.floor(Math.random() * 6) + 1
            };
        }
    };
}
export function executeEngineActionForMonopolyRoomState(roomState, action, options = {}) {
    const engineState = projectMonopolyRoomStateToEngineState(roomState);
    const result = applyEngineAction({
        state: engineState,
        boardConfig: CLASSIC_BOARD_CONFIG,
        action,
        now: options.now ?? Date.now(),
        diceSource: options.diceSource ?? createRuntimeDiceSource()
    });
    applyEngineStateToMonopolyRoomState(roomState, result.state);
    return result;
}
