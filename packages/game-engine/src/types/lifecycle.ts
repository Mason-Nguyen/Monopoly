import type { BoardConfig, PlayerId, UnixTimestampMs } from "@monopoly/shared-types";
import type { EngineMatchState } from "./state.js";

export const ENGINE_LIFECYCLE_OUTCOME_TYPES = ["abandon_player"] as const;

export type EngineLifecycleOutcomeType = (typeof ENGINE_LIFECYCLE_OUTCOME_TYPES)[number];

export interface EngineAbandonPlayerOutcome {
  type: "abandon_player";
  playerId: PlayerId;
  reason: "abandoned";
}

export type EngineLifecycleOutcome = EngineAbandonPlayerOutcome;

export interface EngineLifecycleTransitionInput {
  state: EngineMatchState;
  boardConfig: BoardConfig;
  outcome: EngineLifecycleOutcome;
  now: UnixTimestampMs;
}
