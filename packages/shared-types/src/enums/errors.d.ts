export declare const LOBBY_ERROR_CODES: readonly ["NOT_HOST", "ROOM_NOT_WAITING", "NOT_ENOUGH_PLAYERS", "PLAYERS_NOT_READY", "INVALID_PAYLOAD"];
export type LobbyErrorCode = (typeof LOBBY_ERROR_CODES)[number];
export declare const LOBBY_START_FAILURE_CODES: readonly ["TRANSFER_TIMEOUT", "MATCH_ROOM_CREATION_FAILED", "START_CANCELLED"];
export type LobbyStartFailureCode = (typeof LOBBY_START_FAILURE_CODES)[number];
export declare const GAME_ERROR_CODES: readonly ["NOT_ACTIVE_PLAYER", "INVALID_TURN_PHASE", "PROPERTY_NOT_BUYABLE", "INSUFFICIENT_FUNDS", "MATCH_NOT_PLAYING", "PLAYER_ELIMINATED", "INVALID_PAYLOAD"];
export type GameErrorCode = (typeof GAME_ERROR_CODES)[number];
export declare const TILE_RESOLUTION_SUMMARY_CODES: readonly ["LANDED_ON_START", "PROPERTY_AVAILABLE", "PAID_RENT", "PAID_TAX", "WENT_TO_JAIL", "NO_EFFECT"];
export type TileResolutionSummaryCode = (typeof TILE_RESOLUTION_SUMMARY_CODES)[number];
