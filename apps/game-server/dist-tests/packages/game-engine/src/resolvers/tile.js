import { MVP_JAIL_TURNS_REMAINING } from "@monopoly/shared-config";
import { createAwaitEndTurnState, createAwaitOptionalActionTurnState } from "../reducers/turn.js";
import { EngineRuleError } from "../rules/errors.js";
import { getPropertyConfigOrThrow, getTileConfigOrThrow } from "./board.js";
import { resolveMandatoryBankPayment, resolveMandatoryPlayerPayment } from "./economy.js";
function getActivePlayerOrThrow(state, playerId) {
    const player = state.players[playerId];
    if (!player) {
        throw new EngineRuleError("Active player was not found in engine state.");
    }
    return player;
}
function createTileResolvedEvent(playerId, tile, options) {
    return {
        type: "tile_resolved",
        playerId,
        tileIndex: tile.tileIndex,
        tileType: tile.tileType,
        propertyId: options?.propertyId,
        ownerPlayerId: options?.ownerPlayerId,
        taxAmount: options?.taxAmount
    };
}
export function resolveActivePlayerTile(state, boardConfig, playerId) {
    const activePlayer = getActivePlayerOrThrow(state, playerId);
    const tile = getTileConfigOrThrow(boardConfig, activePlayer.position);
    switch (tile.tileType) {
        case "start":
        case "neutral":
        case "free_parking":
        case "jail": {
            state.turn = createAwaitEndTurnState(state.turn, tile.tileIndex);
            return {
                events: [createTileResolvedEvent(playerId, tile)],
                activePlayerEliminated: false
            };
        }
        case "tax": {
            if (tile.taxAmount === undefined) {
                throw new EngineRuleError(`Tax tile ${tile.key} is missing taxAmount.`);
            }
            const resolvedEvent = createTileResolvedEvent(playerId, tile, {
                taxAmount: tile.taxAmount
            });
            const paymentResolution = resolveMandatoryBankPayment(state, playerId, tile.taxAmount, "tax");
            state.turn = createAwaitEndTurnState(state.turn, tile.tileIndex);
            return {
                events: [resolvedEvent, ...paymentResolution.events],
                activePlayerEliminated: paymentResolution.wasPayerEliminated
            };
        }
        case "property": {
            if (!tile.propertyId) {
                throw new EngineRuleError(`Property tile ${tile.key} is missing propertyId.`);
            }
            const propertyOwnership = state.propertyOwners[tile.propertyId];
            if (!propertyOwnership) {
                throw new EngineRuleError(`Property ownership state is missing for ${tile.propertyId}.`);
            }
            const resolvedEvent = createTileResolvedEvent(playerId, tile, {
                propertyId: tile.propertyId,
                ownerPlayerId: propertyOwnership.ownerPlayerId
            });
            if (propertyOwnership.ownerPlayerId === null) {
                const propertyConfig = getPropertyConfigOrThrow(boardConfig, tile.propertyId);
                if (activePlayer.balance >= propertyConfig.purchasePrice) {
                    state.turn = createAwaitOptionalActionTurnState(state.turn, tile.tileIndex);
                }
                else {
                    state.turn = createAwaitEndTurnState(state.turn, tile.tileIndex);
                }
                return {
                    events: [resolvedEvent],
                    activePlayerEliminated: false
                };
            }
            state.turn = createAwaitEndTurnState(state.turn, tile.tileIndex);
            if (propertyOwnership.ownerPlayerId === playerId) {
                return {
                    events: [resolvedEvent],
                    activePlayerEliminated: false
                };
            }
            const propertyConfig = getPropertyConfigOrThrow(boardConfig, tile.propertyId);
            const rentResolution = resolveMandatoryPlayerPayment(state, playerId, propertyOwnership.ownerPlayerId, propertyConfig.rentAmount, "rent");
            return {
                events: [resolvedEvent, ...rentResolution.events],
                activePlayerEliminated: rentResolution.wasPayerEliminated
            };
        }
        case "go_to_jail": {
            if (tile.targetTileIndex === undefined) {
                throw new EngineRuleError(`Go-to-jail tile ${tile.key} is missing targetTileIndex.`);
            }
            const resolvedEvent = createTileResolvedEvent(playerId, tile);
            const forcedMovementEvent = {
                type: "player_moved",
                playerId,
                fromTileIndex: activePlayer.position,
                toTileIndex: tile.targetTileIndex,
                passedStart: false
            };
            activePlayer.position = tile.targetTileIndex;
            activePlayer.jail = {
                isInJail: true,
                turnsRemaining: MVP_JAIL_TURNS_REMAINING
            };
            state.turn = createAwaitEndTurnState(state.turn, tile.targetTileIndex);
            const jailStateChangedEvent = {
                type: "jail_state_changed",
                playerId,
                isInJail: true,
                turnsRemaining: activePlayer.jail.turnsRemaining
            };
            return {
                events: [resolvedEvent, forcedMovementEvent, jailStateChangedEvent],
                activePlayerEliminated: false
            };
        }
        default:
            throw new EngineRuleError("Unsupported tile type during engine tile resolution.");
    }
}
