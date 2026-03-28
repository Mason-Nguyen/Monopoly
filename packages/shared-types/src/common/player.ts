import type { PlayerId } from "../ids/index.js";

export interface PlayerIdentity {
  playerId: PlayerId;
  displayName: string;
  avatarKey?: string;
  isGuest?: boolean;
}