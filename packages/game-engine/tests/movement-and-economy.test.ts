import assert from 'node:assert/strict';
import test from 'node:test';
import { CLASSIC_BOARD_CONFIG } from '@monopoly/shared-config';
import { applyEngineAction } from '@monopoly/game-engine';
import { createBaseState, FIXED_NOW } from './support/fixtures.ts';

test('createInitialMatchState starts with ordered active player, starting balances, and unowned properties', () => {
  const state = createBaseState('engine-test-initial-state');

  assert.equal(state.turn.activePlayerId, 'p1');
  assert.equal(state.turn.phase, 'await_roll');
  assert.equal(state.players.p1.balance, 1500);
  assert.equal(state.players.p4.position, 0);
  assert.equal(state.propertyOwners.boardwalk.ownerPlayerId, null);
  assert.deepEqual(state.turnOrder, ['p1', 'p2', 'p3', 'p4']);
});

test('roll_dice wraps around Start, awards salary, and exposes buy action on unowned property', () => {
  const state = createBaseState('engine-test-wrap-buy');
  state.players.p1.position = 39;

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

  assert.equal(result.state.players.p1.position, 1);
  assert.equal(result.state.players.p1.balance, 1700);
  assert.equal(result.state.turn.phase, 'await_optional_action');
  assert.equal(result.state.turn.canBuyCurrentProperty, true);
  assert.deepEqual(result.availableActions, ['buy_property', 'skip_optional_action']);
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['dice_rolled', 'player_moved', 'payment_applied', 'tile_resolved']
  );
});

test('buy_property deducts balance, assigns ownership, and moves to await_end_turn', () => {
  const state = createBaseState('engine-test-buy');
  state.players.p1.position = 39;

  const rolled = applyEngineAction({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'roll_dice',
      actingPlayerId: 'p1',
      diceValues: { valueA: 1, valueB: 1 }
    }
  });

  const purchased = applyEngineAction({
    state: rolled.state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'buy_property',
      actingPlayerId: 'p1',
      propertyId: 'mediterranean_avenue'
    }
  });

  assert.equal(purchased.state.players.p1.balance, 1640);
  assert.equal(purchased.state.propertyOwners.mediterranean_avenue.ownerPlayerId, 'p1');
  assert.deepEqual(purchased.state.players.p1.ownedPropertyIds, ['mediterranean_avenue']);
  assert.equal(purchased.state.turn.phase, 'await_end_turn');
  assert.deepEqual(
    purchased.events.map((event) => event.type),
    ['payment_applied', 'property_purchased']
  );
});

test('skip_optional_action declines purchase and moves to await_end_turn', () => {
  const state = createBaseState('engine-test-skip-optional');
  state.players.p1.position = 39;

  const rolled = applyEngineAction({
    state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'roll_dice',
      actingPlayerId: 'p1',
      diceValues: { valueA: 1, valueB: 1 }
    }
  });

  const skipped = applyEngineAction({
    state: rolled.state,
    boardConfig: CLASSIC_BOARD_CONFIG,
    now: FIXED_NOW,
    action: {
      type: 'skip_optional_action',
      actingPlayerId: 'p1'
    }
  });

  assert.equal(skipped.state.players.p1.balance, 1700);
  assert.equal(skipped.state.propertyOwners.mediterranean_avenue.ownerPlayerId, null);
  assert.equal(skipped.state.turn.phase, 'await_end_turn');
  assert.deepEqual(skipped.availableActions, ['end_turn']);
  assert.deepEqual(skipped.events, []);
});

test('landing on an owned property applies rent automatically and ends the turn phase', () => {
  const state = createBaseState('engine-test-rent');
  state.players.p1.position = 0;
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

  assert.equal(result.state.players.p1.position, 3);
  assert.equal(result.state.players.p1.balance, 1496);
  assert.equal(result.state.players.p2.balance, 1504);
  assert.equal(result.state.turn.phase, 'await_end_turn');
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['dice_rolled', 'player_moved', 'tile_resolved', 'payment_applied']
  );
});

test('landing on a tax tile subtracts tax immediately and ends the turn phase', () => {
  const state = createBaseState('engine-test-tax');
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

  assert.equal(result.state.players.p1.position, 4);
  assert.equal(result.state.players.p1.balance, 1300);
  assert.equal(result.state.turn.phase, 'await_end_turn');
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['dice_rolled', 'player_moved', 'tile_resolved', 'payment_applied']
  );
});

test('landing on go_to_jail moves player to jail and marks jail state', () => {
  const state = createBaseState('engine-test-go-to-jail');
  state.players.p1.position = 28;

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

  assert.equal(result.state.players.p1.position, 10);
  assert.equal(result.state.players.p1.jail.isInJail, true);
  assert.equal(result.state.players.p1.jail.turnsRemaining, 1);
  assert.equal(result.state.turn.phase, 'await_end_turn');
  assert.deepEqual(
    result.events.map((event) => event.type),
    ['dice_rolled', 'player_moved', 'tile_resolved', 'player_moved', 'jail_state_changed']
  );
});
