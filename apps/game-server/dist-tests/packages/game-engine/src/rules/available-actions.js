export function getAvailableActions(state) {
    if (state.status !== "playing") {
        return [];
    }
    switch (state.turn.phase) {
        case "await_roll":
            return ["roll_dice"];
        case "await_optional_action":
            return ["buy_property", "skip_optional_action"];
        case "await_end_turn":
        case "turn_complete":
            return ["end_turn"];
        default:
            return [];
    }
}
