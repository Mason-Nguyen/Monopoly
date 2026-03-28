export declare const LOBBY_STATUSES: readonly ["waiting", "starting", "closed"];
export type LobbyStatus = (typeof LOBBY_STATUSES)[number];
export declare const MATCH_STATUSES: readonly ["playing", "finished"];
export type MatchStatus = (typeof MATCH_STATUSES)[number];
export declare const TURN_PHASES: readonly ["await_roll", "resolving_movement", "resolving_tile", "await_optional_action", "await_end_turn", "turn_complete"];
export type TurnPhase = (typeof TURN_PHASES)[number];
