import { MatchPlayerStateSchema } from "../schemas/index.js";
function deriveEliminationReason(isBankrupt, isAbandoned) {
    if (isBankrupt) {
        return "bankrupt";
    }
    if (isAbandoned) {
        return "abandoned";
    }
    return null;
}
function toRoomNullableString(value) {
    return value ?? "";
}
function toRoomNullableNumber(value, emptyValue) {
    return value ?? emptyValue;
}
function getOwnedPropertyIdsByPlayer(state) {
    const ownedPropertyIdsByPlayer = Object.fromEntries(Array.from(state.players.keys()).map((playerId) => [playerId, []]));
    for (const [propertyId, property] of state.board.properties.entries()) {
        if (property.ownerPlayerId === "") {
            continue;
        }
        const playerOwnedProperties = ownedPropertyIdsByPlayer[property.ownerPlayerId];
        if (!playerOwnedProperties) {
            continue;
        }
        playerOwnedProperties.push(propertyId);
    }
    return ownedPropertyIdsByPlayer;
}
function createOrGetRoomPlayer(roomState, playerId) {
    let roomPlayer = roomState.players.get(playerId);
    if (!roomPlayer) {
        roomPlayer = new MatchPlayerStateSchema();
        roomPlayer.playerId = playerId;
        roomState.players.set(playerId, roomPlayer);
    }
    return roomPlayer;
}
export function projectMonopolyRoomStateToEngineState(roomState) {
    const ownedPropertyIdsByPlayer = getOwnedPropertyIdsByPlayer(roomState);
    const players = Object.fromEntries(Array.from(roomState.players.entries()).map(([playerId, player]) => [
        playerId,
        {
            playerId: player.playerId,
            displayName: player.displayName,
            turnOrder: player.turnOrder,
            position: player.position,
            balance: player.balance,
            ownedPropertyIds: [...(ownedPropertyIdsByPlayer[playerId] ?? [])],
            isBankrupt: player.isBankrupt,
            isAbandoned: player.isAbandoned,
            eliminationReason: deriveEliminationReason(player.isBankrupt, player.isAbandoned),
            jail: {
                isInJail: player.jail.isInJail,
                turnsRemaining: player.jail.turnsRemaining
            }
        }
    ]));
    const propertyOwners = Object.fromEntries(Array.from(roomState.board.properties.entries()).map(([propertyId, property]) => [
        propertyId,
        {
            propertyId: property.propertyId,
            ownerPlayerId: property.ownerPlayerId === "" ? null : property.ownerPlayerId
        }
    ]));
    const turnOrder = Object.values(players)
        .sort((left, right) => left.turnOrder - right.turnOrder)
        .map((player) => player.playerId);
    const hasDice = roomState.turn.diceValueA > 0 && roomState.turn.diceValueB > 0;
    const hasResult = roomState.result.winnerPlayerId !== "" && roomState.finishedAt > 0;
    return {
        matchId: roomState.matchId,
        boardId: roomState.board.boardId,
        status: roomState.status,
        startedAt: roomState.startedAt,
        finishedAt: roomState.finishedAt > 0 ? roomState.finishedAt : null,
        players,
        turnOrder,
        propertyOwners,
        turn: {
            turnNumber: roomState.turn.turnNumber,
            activePlayerId: roomState.turn.activePlayerId,
            phase: roomState.turn.phase,
            dice: hasDice
                ? {
                    valueA: roomState.turn.diceValueA,
                    valueB: roomState.turn.diceValueB,
                    total: roomState.turn.diceTotal
                }
                : null,
            currentTileIndex: roomState.turn.currentTileIndex >= 0 ? roomState.turn.currentTileIndex : null,
            canBuyCurrentProperty: roomState.turn.canBuyCurrentProperty,
            awaitingInput: roomState.turn.awaitingInput
        },
        result: hasResult
            ? {
                winnerPlayerId: roomState.result.winnerPlayerId,
                endReason: roomState.result.endReason,
                finishedAt: roomState.result.finishedAt
            }
            : null
    };
}
export function applyEngineStateToMonopolyRoomState(roomState, engineState) {
    roomState.matchId = engineState.matchId;
    roomState.status = engineState.status;
    roomState.startedAt = engineState.startedAt;
    roomState.finishedAt = toRoomNullableNumber(engineState.finishedAt, 0);
    for (const playerId of Array.from(roomState.players.keys())) {
        if (!(playerId in engineState.players)) {
            roomState.players.delete(playerId);
        }
    }
    for (const [playerId, enginePlayer] of Object.entries(engineState.players)) {
        const roomPlayer = createOrGetRoomPlayer(roomState, playerId);
        roomPlayer.playerId = enginePlayer.playerId;
        roomPlayer.displayName = enginePlayer.displayName;
        roomPlayer.turnOrder = enginePlayer.turnOrder;
        roomPlayer.position = enginePlayer.position;
        roomPlayer.balance = enginePlayer.balance;
        roomPlayer.isBankrupt = enginePlayer.isBankrupt;
        roomPlayer.isAbandoned = enginePlayer.isAbandoned;
        roomPlayer.jail.isInJail = enginePlayer.jail.isInJail;
        roomPlayer.jail.turnsRemaining = enginePlayer.jail.turnsRemaining;
    }
    roomState.board.boardId = engineState.boardId;
    roomState.board.tileCount = roomState.board.tiles.length;
    for (const [propertyId, propertyState] of roomState.board.properties.entries()) {
        const enginePropertyOwner = engineState.propertyOwners[propertyId];
        propertyState.ownerPlayerId = toRoomNullableString(enginePropertyOwner?.ownerPlayerId ?? null);
    }
    roomState.turn.turnNumber = engineState.turn.turnNumber;
    roomState.turn.activePlayerId = engineState.turn.activePlayerId;
    roomState.turn.phase = engineState.turn.phase;
    roomState.turn.diceTotal = engineState.turn.dice?.total ?? 0;
    roomState.turn.diceValueA = engineState.turn.dice?.valueA ?? 0;
    roomState.turn.diceValueB = engineState.turn.dice?.valueB ?? 0;
    roomState.turn.currentTileIndex = toRoomNullableNumber(engineState.turn.currentTileIndex, -1);
    roomState.turn.canBuyCurrentProperty = engineState.turn.canBuyCurrentProperty;
    roomState.turn.awaitingInput = engineState.turn.awaitingInput;
    if (!engineState.result) {
        roomState.result.winnerPlayerId = "";
        roomState.result.endReason = "";
        roomState.result.finishedAt = 0;
        return;
    }
    roomState.result.winnerPlayerId = engineState.result.winnerPlayerId;
    roomState.result.endReason = engineState.result.endReason;
    roomState.result.finishedAt = engineState.result.finishedAt;
}
