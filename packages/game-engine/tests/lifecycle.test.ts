import assert from 'node:assert/strict';
import test from 'node:test';
import { CLASSIC_BOARD_CONFIG } from '@monopoly/shared-config';
import { applyEngineLifecycleOutcome } from '@monopoly/game-engine';
import { createBaseState, FIXED_NOW } from './support/fixtures.ts';

test('abandoning a non-active player releases their properties without changing the current turn', () => {
  const state = createBaseState('engine-test-abandon-non-active');
  state.players.p3.ownedPropertyIds.push('boardwalk');
  state.propertyOwners.boardwalk.ownerPlayerId = 'p3';

  const result = applyEngineLifecycleOutcome({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    outcome: {
      type: 'abandon_player',
      playerId: 'p3',
      reason: 'abandoned'
    }
  });

  assert.equal(result.state.players.p3.isAbandoned, true);
  assert.equal(result.state.players.p3.balance, 0);
  assert.equal(result.state.players.p3.ownedPropertyIds.length, 0);
  assert.equal(result.state.propertyOwners.boardwalk.ownerPlayerId, null);
  assert.equal(result.state.turn.activePlayerId, 'p1');
  assert.equal(result.state.turn.turnNumber, 1);
  assert.equal(result.turnCompleted, false);
  assert.deepEqual(result.events.map((event) => event.type), ['player_eliminated']);
});

test('abandoning the active player advances the turn authoritatively', () => {
  const state = createBaseState('engine-test-abandon-active');

  const result = applyEngineLifecycleOutcome({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    outcome: {
      type: 'abandon_player',
      playerId: 'p1',
      reason: 'abandoned'
    }
  });

  assert.equal(result.state.players.p1.isAbandoned, true);
  assert.equal(result.state.turn.activePlayerId, 'p2');
  assert.equal(result.state.turn.turnNumber, 2);
  assert.equal(result.turnCompleted, true);
  assert.deepEqual(result.events.map((event) => event.type), ['player_eliminated', 'turn_advanced']);
});

test('abandonment can finish the match when only one active player remains', () => {
  const state = createBaseState('engine-test-abandon-match-end');
  state.players.p3.isBankrupt = true;
  state.players.p3.eliminationReason = 'bankrupt';
  state.players.p4.isBankrupt = true;
  state.players.p4.eliminationReason = 'bankrupt';

  const result = applyEngineLifecycleOutcome({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    outcome: {
      type: 'abandon_player',
      playerId: 'p2',
      reason: 'abandoned'
    }
  });

  assert.equal(result.state.status, 'finished');
  assert.equal(result.state.result?.winnerPlayerId, 'p1');
  assert.equal(result.state.result?.endReason, 'last_player_remaining');
  assert.deepEqual(result.availableActions, []);
  assert.deepEqual(result.events.map((event) => event.type), ['player_eliminated', 'match_ended']);
});
