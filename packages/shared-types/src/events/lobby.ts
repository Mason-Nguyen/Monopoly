import type { LobbyErrorCode, LobbyStartFailureCode } from "../enums/index.js";
import type { LobbyId, MatchId, UnixTimestampMs } from "../ids/index.js";
import type { ErrorEventPayload } from "../common/index.js";

export const LOBBY_ERROR_EVENT = "lobby:error";
export const LOBBY_MATCH_STARTING_EVENT = "lobby:matchStarting";
export const LOBBY_MATCH_START_FAILED_EVENT = "lobby:matchStartFailed";

export type LobbyEventName =
  | typeof LOBBY_ERROR_EVENT
  | typeof LOBBY_MATCH_STARTING_EVENT
  | typeof LOBBY_MATCH_START_FAILED_EVENT;

export interface LobbyErrorEvent extends ErrorEventPayload<LobbyErrorCode> {}

export interface LobbyMatchStartingEvent {
  lobbyId: LobbyId;
  matchId: MatchId;
  roomId: string;
  transferDeadlineAt?: UnixTimestampMs;
}

export interface LobbyMatchStartFailedEvent extends ErrorEventPayload<LobbyStartFailureCode> {}