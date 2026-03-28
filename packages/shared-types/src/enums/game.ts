export const CONNECTION_STATUSES = [
  "connected",
  "disconnected_reserved",
  "reconnected",
  "abandoned"
] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const PAYMENT_REASONS = [
  "property_purchase",
  "rent",
  "tax",
  "start_salary"
] as const;
export type PaymentReason = (typeof PAYMENT_REASONS)[number];

export const MATCH_END_REASONS = [
  "last_player_remaining",
  "all_others_bankrupt",
  "all_others_abandoned",
  "manual_termination_dev_only"
] as const;
export type MatchEndReason = (typeof MATCH_END_REASONS)[number];

export const ELIMINATION_REASONS = ["bankrupt", "abandoned"] as const;
export type EliminationReason = (typeof ELIMINATION_REASONS)[number];