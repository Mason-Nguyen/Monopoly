export declare const CONNECTION_STATUSES: readonly ["connected", "disconnected_reserved", "reconnected", "abandoned"];
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];
export declare const PAYMENT_REASONS: readonly ["property_purchase", "rent", "tax", "start_salary"];
export type PaymentReason = (typeof PAYMENT_REASONS)[number];
export declare const MATCH_END_REASONS: readonly ["last_player_remaining", "all_others_bankrupt", "all_others_abandoned", "manual_termination_dev_only"];
export type MatchEndReason = (typeof MATCH_END_REASONS)[number];
export declare const ELIMINATION_REASONS: readonly ["bankrupt", "abandoned"];
export type EliminationReason = (typeof ELIMINATION_REASONS)[number];
