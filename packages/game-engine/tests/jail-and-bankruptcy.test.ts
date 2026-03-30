import assert from 'node:assert/strict';
import test from 'node:test';
import { CLASSIC_BOARD_CONFIG } from '@monopoly/shared-config';
import { applyEngineAction } from '@monopoly/game-engine';
import { createBaseState, FIXED_NOW } from './support/fixtures.ts';

test('bankruptcy by tax eliminates the player and advances the turn', () => {
  const state = createBaseState('engine-test-tax-bankrupt');
  state.players.p1.balance = 100;
  state.players.p1.position = 2;

  const result = applyEngineAction({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'roll_dice',
      actingPlayerId: 'p1',
      diceValues: { valueA: 1, valueB: 1 }
    }
  });

  assert.equal(result.state.players.p1.isBankrupt, true);
  assert.equal(result.state.players.p1.balance, 0);
  assert.equal(result.state.turn.activePlayerId, 'p2');
  assert.equal(result.turnCompleted, true);
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['dice_rolled', 'player_moved', 'tile_resolved', 'player_eliminated', 'turn_advanced']
  );
});

test('bankruptcy by rent releases owned properties back to the bank', () => {
  const state = createBaseState('engine-test-rent-bankrupt');
  state.players.p1.balance = 3;
  state.players.p1.ownedPropertyIds.push('boardwalk');
  state.propertyOwners.boardwalk.ownerPlayerId = 'p1';
  state.propertyOwners.baltic_avenue.ownerPlayerId = 'p2';
  state.players.p2.ownedPropertyIds.push('baltic_avenue');

  const result = applyEngineAction({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'roll_dice',
      actingPlayerId: 'p1',
      diceValues: { valueA: 1, valueB: 2 }
    }
  });

  assert.equal(result.state.players.p1.isBankrupt, true);
  assert.equal(result.state.players.p1.ownedPropertyIds.length, 0);
  assert.equal(result.state.propertyOwners.boardwalk.ownerPlayerId, null);
  assert.equal(result.state.players.p2.balance, 1500);
  assert.equal(result.state.turn.activePlayerId, 'p2');
});

test('match ends when only one active player remains after elimination', () => {
  const state = createBaseState('engine-test-match-ended');
  state.players.p3.isBankrupt = true;
  state.players.p3.eliminationReason = 'bankrupt';
  state.players.p4.isBankrupt = true;
  state.players.p4.eliminationReason = 'bankrupt';
  state.players.p1.balance = 100;
  state.players.p1.position = 2;

  const result = applyEngineAction({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'roll_dice',
      actingPlayerId: 'p1',
      diceValues: { valueA: 1, valueB: 1 }
    }
  });

  assert.equal(result.state.status, 'finished');
  assert.equal(result.state.result?.winnerPlayerId, 'p2');
  assert.equal(result.state.result?.endReason, 'all_others_bankrupt');
  assert.deepEqual(result.availableActions, []);
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['dice_rolled', 'player_moved', 'tile_resolved', 'player_eliminated', 'match_ended']
  );
});

test('ending a turn skips a jailed player for one full turn and releases them automatically', () => {
  const state = createBaseState('engine-test-jail-skip');
  state.players.p2.jail = {
    isInJail: true,
    turnsRemaining: 1
  };
  state.turn = {
    ...state.turn,
    phase: 'await_end_turn',
    currentTileIndex: 0,
    awaitingInput: true
  };

  const result = applyEngineAction({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'end_turn',
      actingPlayerId: 'p1'
    }
  });

  assert.equal(result.state.turn.activePlayerId, 'p3');
  assert.equal(result.state.turn.turnNumber, 3);
  assert.equal(result.state.players.p2.jail.isInJail, false);
  assert.equal(result.state.players.p2.jail.turnsRemaining, 0);
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['turn_advanced', 'jail_state_changed', 'turn_advanced']
  );
});
