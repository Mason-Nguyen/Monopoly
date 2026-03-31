import { createAwaitRollTurnState, getNextActivePlayerId } from "../reducers/turn.js";
import { EngineRuleError } from "../rules/errors.js";
import { finishMatchIfSinglePlayerRemaining } from "./elimination.js";
export function advanceToNextPlayableTurn(state, fromPlayerId, now) {
    const matchEndedEvent = finishMatchIfSinglePlayerRemaining(state, now);
    if (matchEndedEvent) {
        return [matchEndedEvent];
    }
    let currentFromPlayerId = fromPlayerId;
    let nextActivePlayerId = getNextActivePlayerId(state, currentFromPlayerId);
    let nextTurn = state.turn;
    const visited = new Set();
    const events = [];
    while (true) {
        if (visited.has(nextActivePlayerId)) {
            throw new EngineRuleError("Engine turn advancement cycled without finding a playable player.");
        }
        visited.add(nextActivePlayerId);
        nextTurn = createAwaitRollTurnState(nextTurn, nextActivePlayerId);
        const turnAdvancedEvent = {
            type: "turn_advanced",
            fromPlayerId: currentFromPlayerId,
            toPlayerId: nextActivePlayerId,
            turnNumber: nextTurn.turnNumber
        };
        events.push(turnAdvancedEvent);
        const nextPlayer = state.players[nextActivePlayerId];
        if (!nextPlayer) {
            throw new EngineRuleError(`Next active engine player ${nextActivePlayerId} was not found.`);
        }
        if (nextPlayer.jail.isInJail && nextPlayer.jail.turnsRemaining > 0) {
            nextPlayer.jail.turnsRemaining = Math.max(0, nextPlayer.jail.turnsRemaining - 1);
            nextPlayer.jail.isInJail = nextPlayer.jail.turnsRemaining > 0;
            const jailEvent = {
                type: "jail_state_changed",
                playerId: nextActivePlayerId,
                isInJail: nextPlayer.jail.isInJail,
                turnsRemaining: nextPlayer.jail.turnsRemaining
            };
            events.push(jailEvent);
            currentFromPlayerId = nextActivePlayerId;
            nextActivePlayerId = getNextActivePlayerId(state, currentFromPlayerId);
            continue;
        }
        state.turn = nextTurn;
        return events;
    }
}
