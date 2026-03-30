import { CLASSIC_BOARD_CONFIG } from '@monopoly/shared-config';
import { createInitialMatchState } from '@monopoly/game-engine';

export const FIXED_NOW = 1_710_000_000_000;

export function createBaseState(matchId: string) {
  return createInitialMatchState({
    matchId,
    boardConfig: CLASSIC_BOARD_CONFIG,
    startedAt: FIXED_NOW,
    players: [
      { playerId: 'p1', displayName: 'Player 1', turnOrder: 1 },
      { playerId: 'p2', displayName: 'Player 2', turnOrder: 2 },
      { playerId: 'p3', displayName: 'Player 3', turnOrder: 3 },
      { playerId: 'p4', displayName: 'Player 4', turnOrder: 4 }
    ]
  });
}
