import { MVP_MAX_PLAYERS, MVP_MIN_PLAYERS } from "@monopoly/shared-config";
const PLAYING_STATUS = "playing";
const INITIAL_TURN_PHASE = "await_roll";
function createPlayerState(boardConfig, player) {
    return {
        playerId: player.playerId,
        displayName: player.displayName,
        turnOrder: player.turnOrder,
        position: 0,
        balance: boardConfig.startingMoney,
        ownedPropertyIds: [],
        isBankrupt: false,
        isAbandoned: false,
        eliminationReason: null,
        jail: {
            isInJail: false,
            turnsRemaining: 0
        }
    };
}
function createPropertyOwners(boardConfig) {
    return Object.fromEntries(boardConfig.properties.map((property) => [
        property.propertyId,
        {
            propertyId: property.propertyId,
            ownerPlayerId: null
        }
    ]));
}
function createInitialTurnState(activePlayerId) {
    return {
        turnNumber: 1,
        activePlayerId,
        phase: INITIAL_TURN_PHASE,
        dice: null,
        currentTileIndex: null,
        canBuyCurrentProperty: false,
        awaitingInput: true
    };
}
export function createInitialMatchState(input) {
    const players = [...input.players].sort((left, right) => left.turnOrder - right.turnOrder);
    if (players.length < MVP_MIN_PLAYERS || players.length > MVP_MAX_PLAYERS) {
        throw new Error(`Engine match state requires between ${MVP_MIN_PLAYERS} and ${MVP_MAX_PLAYERS} players.`);
    }
    const playerIds = new Set(players.map((player) => player.playerId));
    if (playerIds.size !== players.length) {
        throw new Error("Engine match state requires unique player IDs.");
    }
    const turnOrders = new Set(players.map((player) => player.turnOrder));
    if (turnOrders.size !== players.length) {
        throw new Error("Engine match state requires unique player turn orders.");
    }
    const activePlayerId = players[0]?.playerId;
    if (!activePlayerId) {
        throw new Error("Engine match state requires at least one active player.");
    }
    const playerStateMap = Object.fromEntries(players.map((player) => [player.playerId, createPlayerState(input.boardConfig, player)]));
    return {
        matchId: input.matchId,
        boardId: input.boardConfig.boardId,
        status: PLAYING_STATUS,
        startedAt: input.startedAt,
        finishedAt: null,
        players: playerStateMap,
        turnOrder: players.map((player) => player.playerId),
        propertyOwners: createPropertyOwners(input.boardConfig),
        turn: createInitialTurnState(activePlayerId),
        result: null
    };
}
export function cloneMatchState(state) {
    return {
        ...state,
        players: Object.fromEntries(Object.entries(state.players).map(([playerId, player]) => [
            playerId,
            {
                ...player,
                ownedPropertyIds: [...player.ownedPropertyIds],
                jail: {
                    ...player.jail
                }
            }
        ])),
        turnOrder: [...state.turnOrder],
        propertyOwners: Object.fromEntries(Object.entries(state.propertyOwners).map(([propertyId, property]) => [
            propertyId,
            {
                ...property
            }
        ])),
        turn: {
            ...state.turn,
            dice: state.turn.dice ? { ...state.turn.dice } : null
        },
        result: state.result ? { ...state.result } : null
    };
}
