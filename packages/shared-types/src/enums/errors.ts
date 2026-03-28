export const LOBBY_ERROR_CODES = [
  "NOT_HOST",
  "ROOM_NOT_WAITING",
  "NOT_ENOUGH_PLAYERS",
  "PLAYERS_NOT_READY",
  "INVALID_PAYLOAD"
] as const;
export type LobbyErrorCode = (typeof LOBBY_ERROR_CODES)[number];

export const LOBBY_START_FAILURE_CODES = [
  "TRANSFER_TIMEOUT",
  "MATCH_ROOM_CREATION_FAILED",
  "START_CANCELLED"
] as const;
export type LobbyStartFailureCode = (typeof LOBBY_START_FAILURE_CODES)[number];

export const GAME_ERROR_CODES = [
  "NOT_ACTIVE_PLAYER",
  "INVALID_TURN_PHASE",
  "PROPERTY_NOT_BUYABLE",
  "INSUFFICIENT_FUNDS",
  "MATCH_NOT_PLAYING",
  "PLAYER_ELIMINATED",
  "INVALID_PAYLOAD"
] as const;
export type GameErrorCode = (typeof GAME_ERROR_CODES)[number];

export const TILE_RESOLUTION_SUMMARY_CODES = [
  "LANDED_ON_START",
  "PROPERTY_AVAILABLE",
  "PAID_RENT",
  "PAID_TAX",
  "WENT_TO_JAIL",
  "NO_EFFECT"
] as const;
export type TileResolutionSummaryCode = (typeof TILE_RESOLUTION_SUMMARY_CODES)[number];