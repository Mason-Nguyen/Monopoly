import type {
  EngineLifecycleOutcome,
  EngineTransitionResult
} from "@monopoly/game-engine";
import { applyEngineLifecycleOutcome } from "@monopoly/game-engine";
import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import type { MonopolyRoomStateSchema } from "../schemas/index.js";
import {
  applyEngineStateToMonopolyRoomState,
  projectMonopolyRoomStateToEngineState
} from "./engine-state-projection.js";

export interface ExecuteRoomEngineLifecycleOutcomeOptions {
  now?: number;
}

export function executeEngineLifecycleOutcomeForMonopolyRoomState(
  roomState: MonopolyRoomStateSchema,
  outcome: EngineLifecycleOutcome,
  options: ExecuteRoomEngineLifecycleOutcomeOptions = {}
): EngineTransitionResult {
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
