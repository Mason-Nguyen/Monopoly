import type { EngineActionType, EngineMatchState } from "../types/index.js";

export function getAvailableActions(state: EngineMatchState): EngineActionType[] {
  switch (state.turn.phase) {
    case "await_roll":
      return ["roll_dice"];
    case "await_optional_action":
      return ["buy_property", "end_turn"];
    case "await_end_turn":
    case "turn_complete":
      return ["end_turn"];
    default:
      return [];
  }
}