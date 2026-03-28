export const LOBBY_STATUSES = ["waiting", "starting", "closed"] as const;
export type LobbyStatus = (typeof LOBBY_STATUSES)[number];

export const MATCH_STATUSES = ["playing", "finished"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const TURN_PHASES = [
  "await_roll",
  "resolving_movement",
  "resolving_tile",
  "await_optional_action",
  "await_end_turn",
  "turn_complete"
] as const;
export type TurnPhase = (typeof TURN_PHASES)[number];