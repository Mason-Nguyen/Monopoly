import type { ConnectionStatus, EliminationReason, GameErrorCode, MatchEndReason, PaymentReason, TileResolutionSummaryCode, TileType } from "../enums/index.js";
import type { PlayerId, PropertyId, TileIndex, UnixTimestampMs } from "../ids/index.js";
import type { ErrorEventPayload } from "../common/index.js";
export declare const GAME_ERROR_EVENT = "game:error";
export declare const GAME_DICE_ROLLED_EVENT = "game:diceRolled";
export declare const GAME_PLAYER_MOVED_EVENT = "game:playerMoved";
export declare const GAME_TILE_RESOLVED_EVENT = "game:tileResolved";
export declare const GAME_PAYMENT_APPLIED_EVENT = "game:paymentApplied";
export declare const GAME_PROPERTY_PURCHASED_EVENT = "game:propertyPurchased";
export declare const GAME_PLAYER_ELIMINATED_EVENT = "game:playerEliminated";
export declare const GAME_PLAYER_CONNECTION_CHANGED_EVENT = "game:playerConnectionChanged";
export declare const GAME_RESULT_READY_EVENT = "game:resultReady";
export type GameEventName = typeof GAME_ERROR_EVENT | typeof GAME_DICE_ROLLED_EVENT | typeof GAME_PLAYER_MOVED_EVENT | typeof GAME_TILE_RESOLVED_EVENT | typeof GAME_PAYMENT_APPLIED_EVENT | typeof GAME_PROPERTY_PURCHASED_EVENT | typeof GAME_PLAYER_ELIMINATED_EVENT | typeof GAME_PLAYER_CONNECTION_CHANGED_EVENT | typeof GAME_RESULT_READY_EVENT;
export interface GameErrorEvent extends ErrorEventPayload<GameErrorCode> {
}
export interface GameDiceRolledEvent {
    playerId: PlayerId;
    diceValueA: number;
    diceValueB: number;
    diceTotal: number;
}
export interface GamePlayerMovedEvent {
    playerId: PlayerId;
    fromTileIndex: TileIndex;
    toTileIndex: TileIndex;
    passedStart: boolean;
}
export interface GameTileResolvedEvent {
    playerId: PlayerId;
    tileIndex: TileIndex;
    tileType: TileType;
    summaryCode: TileResolutionSummaryCode;
    message: string;
}
export interface GamePaymentAppliedEvent {
    fromPlayerId: PlayerId;
    toPlayerId?: PlayerId;
    amount: number;
    reason: PaymentReason;
}
export interface GamePropertyPurchasedEvent {
    playerId: PlayerId;
    propertyId: PropertyId;
    tileIndex: TileIndex;
    purchasePrice: number;
}
export interface GamePlayerEliminatedEvent {
    playerId: PlayerId;
    reason: EliminationReason;
}
export interface GamePlayerConnectionChangedEvent {
    playerId: PlayerId;
    status: ConnectionStatus;
    reconnectDeadlineAt?: UnixTimestampMs;
}
export interface GameResultReadyEvent {
    winnerPlayerId: PlayerId;
    endReason: MatchEndReason;
    finishedAt: UnixTimestampMs;
}
