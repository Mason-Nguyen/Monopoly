import assert from "node:assert/strict";
import test from "node:test";
import { GAME_BUY_PROPERTY_COMMAND, GAME_DICE_ROLLED_EVENT, GAME_END_TURN_COMMAND, GAME_ERROR_EVENT, GAME_PAYMENT_APPLIED_EVENT, GAME_PLAYER_CONNECTION_CHANGED_EVENT, GAME_PLAYER_ELIMINATED_EVENT, GAME_PLAYER_MOVED_EVENT, GAME_PROPERTY_PURCHASED_EVENT, GAME_RESULT_READY_EVENT, GAME_ROLL_DICE_COMMAND, GAME_TILE_RESOLVED_EVENT } from "@monopoly/shared-types";
import { ErrorCode } from "colyseus";
import { syncIdleTurnTimeout } from "../src/services/index.js";
import { createSeededMonopolyRoom } from "./support/room.js";
import { createSeededMatchJoinOptions, createTestClient, FakeRoomClock, getBroadcastPayloads, getSentMessages, withMockedMathRandom } from "./support/index.js";
function getMessageHandler(room, command) {
    const handler = room.messages[command];
    assert.ok(handler, `Expected message handler for ${command}.`);
    return handler;
}
function setRoomClock(room, clock) {
    room.clock = clock;
}
test("happy path gameplay commands mutate room state and emit expected events", async () => {
    process.env.DATABASE_URL = "";
    const { room, broadcastRecorder } = createSeededMonopolyRoom();
    const client = createTestClient();
    room.onJoin(client, createSeededMatchJoinOptions({ playerId: "p1", matchId: room.state.matchId }));
    broadcastRecorder.clear();
    const rollDice = getMessageHandler(room, GAME_ROLL_DICE_COMMAND);
    const buyProperty = getMessageHandler(room, GAME_BUY_PROPERTY_COMMAND);
    const endTurn = getMessageHandler(room, GAME_END_TURN_COMMAND);
    await withMockedMathRandom([0, 0.2], () => {
        rollDice(client);
    });
    assert.equal(room.state.turn.phase, "await_optional_action");
    assert.equal(room.state.turn.currentTileIndex, 3);
    assert.equal(room.state.turn.canBuyCurrentProperty, true);
    assert.deepEqual(broadcastRecorder.broadcasts.map((record) => record.eventName), [GAME_DICE_ROLLED_EVENT, GAME_PLAYER_MOVED_EVENT, GAME_TILE_RESOLVED_EVENT]);
    const propertyId = room.state.board.tiles.find((tile) => tile.tileIndex === 3)?.propertyId;
    assert.ok(propertyId);
    broadcastRecorder.clear();
    buyProperty(client, { propertyId });
    assert.equal(room.state.board.properties.get(propertyId)?.ownerPlayerId, "p1");
    assert.equal(room.state.turn.phase, "await_end_turn");
    assert.deepEqual(broadcastRecorder.broadcasts.map((record) => record.eventName), [GAME_PAYMENT_APPLIED_EVENT, GAME_PROPERTY_PURCHASED_EVENT]);
    broadcastRecorder.clear();
    endTurn(client);
    assert.equal(room.state.turn.activePlayerId, "p2");
    assert.equal(room.state.turn.turnNumber, 2);
    assert.equal(broadcastRecorder.broadcasts.length, 0);
    assert.equal(getSentMessages(client, GAME_ERROR_EVENT).length, 0);
});
test("inactive player commands are rejected without mutating room state", () => {
    process.env.DATABASE_URL = "";
    const { room } = createSeededMonopolyRoom();
    const activeClient = createTestClient();
    const inactiveClient = createTestClient();
    room.onJoin(activeClient, createSeededMatchJoinOptions({ playerId: "p1", matchId: room.state.matchId }));
    room.onJoin(inactiveClient, createSeededMatchJoinOptions({ playerId: "p2", matchId: room.state.matchId }));
    const snapshot = {
        activePlayerId: room.state.turn.activePlayerId,
        turnNumber: room.state.turn.turnNumber,
        phase: room.state.turn.phase
    };
    const endTurn = getMessageHandler(room, GAME_END_TURN_COMMAND);
    endTurn(inactiveClient);
    assert.deepEqual({
        activePlayerId: room.state.turn.activePlayerId,
        turnNumber: room.state.turn.turnNumber,
        phase: room.state.turn.phase
    }, snapshot);
    const errors = getSentMessages(inactiveClient, GAME_ERROR_EVENT);
    assert.equal(errors.length, 1);
    assert.equal(errors[0]?.code, "NOT_ACTIVE_PLAYER");
});
test("unknown players are rejected from joining an active seeded room", () => {
    process.env.DATABASE_URL = "";
    const { room } = createSeededMonopolyRoom();
    const stranger = createTestClient();
    assert.throws(() => {
        room.onJoin(stranger, createSeededMatchJoinOptions({ playerId: "stranger", matchId: room.state.matchId }));
    }, (error) => {
        assert.equal(error.code, ErrorCode.MATCHMAKE_EXPIRED);
        assert.match(String(error.message), /not part of this active match room/i);
        return true;
    });
});
test("reserved seats can be reclaimed without creating duplicate player entries", () => {
    process.env.DATABASE_URL = "";
    const { room, broadcastRecorder } = createSeededMonopolyRoom();
    const client = createTestClient();
    room.onJoin(client, createSeededMatchJoinOptions({ playerId: "p1", matchId: room.state.matchId }));
    broadcastRecorder.clear();
    const player = room.state.players.get("p1");
    assert.ok(player);
    player.connection.status = "disconnected_reserved";
    player.connection.reconnectDeadlineAt = Date.now() + 30_000;
    room.onReconnect(client);
    assert.equal(room.state.players.size, 4);
    assert.equal(room.state.players.get("p1")?.connection.status, "reconnected");
    const connectionChanges = getBroadcastPayloads(broadcastRecorder, GAME_PLAYER_CONNECTION_CHANGED_EVENT);
    assert.equal(connectionChanges.length, 1);
    assert.equal(connectionChanges[0]?.playerId, "p1");
    assert.equal(connectionChanges[0]?.status, "reconnected");
});
test("disconnect expiry resolves through authoritative abandonment and emits finish events", async () => {
    process.env.DATABASE_URL = "";
    const { room, broadcastRecorder } = createSeededMonopolyRoom();
    const client = createTestClient();
    room.onJoin(client, createSeededMatchJoinOptions({ playerId: "p1", matchId: room.state.matchId }));
    room.state.players.get("p3").isBankrupt = true;
    room.state.players.get("p4").isBankrupt = true;
    broadcastRecorder.clear();
    room.allowReconnection = async () => {
        throw new Error("reconnect expired");
    };
    await room.onDrop(client, 1001);
    await Promise.resolve();
    assert.equal(room.state.status, "finished");
    assert.equal(room.state.players.get("p1")?.isAbandoned, true);
    assert.equal(room.state.players.get("p1")?.connection.status, "abandoned");
    assert.equal(room.state.result.winnerPlayerId, "p2");
    assert.deepEqual(broadcastRecorder.broadcasts.map((record) => record.eventName), [
        GAME_PLAYER_CONNECTION_CHANGED_EVENT,
        GAME_PLAYER_CONNECTION_CHANGED_EVENT,
        GAME_PLAYER_ELIMINATED_EVENT,
        GAME_RESULT_READY_EVENT
    ]);
});
test("idle timeout auto-rolls, auto-skips, auto-ends, and stops scheduling while disconnected", async () => {
    process.env.DATABASE_URL = "";
    const clock = new FakeRoomClock();
    const { room, broadcastRecorder } = createSeededMonopolyRoom();
    setRoomClock(room, clock);
    const client = createTestClient();
    room.onJoin(client, createSeededMatchJoinOptions({ playerId: "p1", matchId: room.state.matchId }));
    assert.equal(clock.pendingCount, 1);
    broadcastRecorder.clear();
    await withMockedMathRandom([0, 0.2], () => {
        const ran = clock.runNext();
        assert.equal(ran, true);
    });
    assert.equal(room.state.turn.phase, "await_optional_action");
    assert.deepEqual(broadcastRecorder.broadcasts.map((record) => record.eventName), [GAME_DICE_ROLLED_EVENT, GAME_PLAYER_MOVED_EVENT, GAME_TILE_RESOLVED_EVENT]);
    assert.equal(clock.pendingCount, 1);
    const propertyId = room.state.board.tiles.find((tile) => tile.tileIndex === 3)?.propertyId;
    assert.ok(propertyId);
    broadcastRecorder.clear();
    const skipped = clock.runNext();
    assert.equal(skipped, true);
    assert.equal(room.state.turn.phase, "await_end_turn");
    assert.equal(room.state.board.properties.get(propertyId)?.ownerPlayerId, "");
    assert.equal(broadcastRecorder.broadcasts.length, 0);
    assert.equal(clock.pendingCount, 1);
    const ended = clock.runNext();
    assert.equal(ended, true);
    assert.equal(room.state.turn.activePlayerId, "p2");
    assert.equal(room.state.turn.turnNumber, 2);
    assert.equal(clock.pendingCount, 0);
    room.state.turn.activePlayerId = "p1";
    room.state.turn.phase = "await_roll";
    room.state.turn.awaitingInput = true;
    room.state.turn.turnNumber = 3;
    room.state.players.get("p1").connection.status = "disconnected_reserved";
    room.state.players.get("p1").connection.reconnectDeadlineAt = Date.now() + 30_000;
    room.idleTurnTimeout?.clear();
    room.idleTurnTimeout = null;
    room.idleTurnTimeoutContext = null;
    clock.clear();
    syncIdleTurnTimeout(room);
    assert.equal(clock.pendingCount, 0);
});
