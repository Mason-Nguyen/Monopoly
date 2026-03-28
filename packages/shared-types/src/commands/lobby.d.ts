import type { LobbyId, MatchId, PlayerId } from "../ids/index.js";
export declare const LOBBY_SET_READY_COMMAND = "lobby:setReady";
export declare const LOBBY_START_MATCH_COMMAND = "lobby:startMatch";
export type LobbyCommandName = typeof LOBBY_SET_READY_COMMAND | typeof LOBBY_START_MATCH_COMMAND;
export interface LobbySetReadyCommand {
    isReady: boolean;
}
export interface LobbyStartMatchCommand {
}
export interface LobbyJoinOptions {
    playerId: PlayerId;
    displayName: string;
    avatarKey?: string;
}
export interface LobbyMatchTransferContext {
    lobbyId: LobbyId;
    matchId: MatchId;
}
