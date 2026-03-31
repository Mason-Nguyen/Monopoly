import { applyEngineLifecycleOutcome } from "@monopoly/game-engine";
import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import { applyEngineStateToMonopolyRoomState, projectMonopolyRoomStateToEngineState } from "./engine-state-projection.js";
export function executeEngineLifecycleOutcomeForMonopolyRoomState(roomState, outcome, options = {}) {
    const engineState = projectMonopolyRoomStateToEngineState(roomState);
    const result = applyEngineLifecycleOutcome({
        state: engineState,
        boardConfig: CLASSIC_BOARD_CONFIG,
        outcome,
        now: options.now ?? Date.now()
    });
    applyEngineStateToMonopolyRoomState(roomState, result.state);
    return result;
}
