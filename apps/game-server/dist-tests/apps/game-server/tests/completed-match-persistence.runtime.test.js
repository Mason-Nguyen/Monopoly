import assert from "node:assert/strict";
import test from "node:test";
import { persistCompletedMonopolyRoomIfNeeded } from "../src/services/completed-match-persistence.js";
import { createFinishedPersistenceRoom } from "./support/persistence.js";
async function withDatabaseUrl(databaseUrl, callback) {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    if (databaseUrl === undefined) {
        delete process.env.DATABASE_URL;
    }
    else {
        process.env.DATABASE_URL = databaseUrl;
    }
    try {
        return await callback();
    }
    finally {
        if (previousDatabaseUrl === undefined) {
            delete process.env.DATABASE_URL;
        }
        else {
            process.env.DATABASE_URL = previousDatabaseUrl;
        }
    }
}
function createMockRepository(options = {}) {
    const calls = {
        find: 0,
        persist: 0,
        snapshots: []
    };
    const repository = {
        async findCompletedMatchById() {
            calls.find += 1;
            return options.findResult ?? null;
        },
        async persistCompletedMatchSnapshot(snapshot) {
            calls.persist += 1;
            calls.snapshots.push(snapshot);
            await options.onPersist?.(snapshot);
        }
    };
    return {
        repository,
        calls
    };
}
test("non-finished room persistence is ignored", async () => {
    await withDatabaseUrl("postgresql://mock-user:mock-pass@localhost:5432/mock-db", async () => {
        const { room } = createFinishedPersistenceRoom();
        const { repository, calls } = createMockRepository();
        room.state.status = "playing";
        room.state.finishedAt = 0;
        room.state.result.finishedAt = 0;
        room.state.result.endReason = "";
        room.state.result.winnerPlayerId = "";
        await persistCompletedMonopolyRoomIfNeeded(room, repository);
        assert.equal(calls.find, 0);
        assert.equal(calls.persist, 0);
        assert.equal(room.completedMatchPersistenceStatus, "idle");
        assert.equal(room.completedMatchPersistenceError, "");
        assert.equal(room.completedMatchPersistencePromise, null);
    });
});
test("missing DATABASE_URL marks finished room persistence as skipped_not_configured", async () => {
    await withDatabaseUrl(undefined, async () => {
        const { room } = createFinishedPersistenceRoom();
        const { repository, calls } = createMockRepository();
        await persistCompletedMonopolyRoomIfNeeded(room, repository);
        assert.equal(calls.find, 0);
        assert.equal(calls.persist, 0);
        assert.equal(room.completedMatchPersistenceStatus, "skipped_not_configured");
        assert.equal(room.completedMatchPersistenceError, "");
        assert.equal(room.completedMatchPersistencePromise, null);
    });
});
test("repository failure marks room failed and keeps the room retryable", async () => {
    await withDatabaseUrl("postgresql://mock-user:mock-pass@localhost:5432/mock-db", async () => {
        const { room } = createFinishedPersistenceRoom();
        const { repository, calls } = createMockRepository({
            onPersist: async () => {
                throw new Error("simulated persistence failure");
            }
        });
        await assert.rejects(() => persistCompletedMonopolyRoomIfNeeded(room, repository), /simulated persistence failure/);
        assert.equal(calls.find, 1);
        assert.equal(calls.persist, 1);
        assert.equal(room.completedMatchPersistenceStatus, "failed");
        assert.equal(room.completedMatchPersistenceError, "simulated persistence failure");
        assert.equal(room.completedMatchPersistencePromise, null);
    });
});
test("failed persistence can be retried successfully on the same finished room", async () => {
    await withDatabaseUrl("postgresql://mock-user:mock-pass@localhost:5432/mock-db", async () => {
        const { room } = createFinishedPersistenceRoom();
        const failing = createMockRepository({
            onPersist: async () => {
                throw new Error("temporary repository failure");
            }
        });
        const succeeding = createMockRepository();
        await assert.rejects(() => persistCompletedMonopolyRoomIfNeeded(room, failing.repository), /temporary repository failure/);
        await persistCompletedMonopolyRoomIfNeeded(room, succeeding.repository);
        assert.equal(failing.calls.find, 1);
        assert.equal(failing.calls.persist, 1);
        assert.equal(succeeding.calls.find, 1);
        assert.equal(succeeding.calls.persist, 1);
        assert.equal(room.completedMatchPersistenceStatus, "persisted");
        assert.equal(room.completedMatchPersistenceError, "");
        assert.equal(room.completedMatchPersistencePromise, null);
    });
});
test("concurrent persistence attempts share one in-flight promise", async () => {
    await withDatabaseUrl("postgresql://mock-user:mock-pass@localhost:5432/mock-db", async () => {
        const { room } = createFinishedPersistenceRoom();
        let resolvePersist;
        const persistGate = new Promise((resolve) => {
            resolvePersist = resolve;
        });
        const mock = createMockRepository({
            onPersist: async () => {
                await persistGate;
            }
        });
        const firstAttempt = persistCompletedMonopolyRoomIfNeeded(room, mock.repository);
        const secondAttempt = persistCompletedMonopolyRoomIfNeeded(room, mock.repository);
        await Promise.resolve();
        assert.equal(room.completedMatchPersistenceStatus, "persisting");
        assert.notEqual(room.completedMatchPersistencePromise, null);
        resolvePersist();
        await Promise.all([firstAttempt, secondAttempt]);
        assert.equal(mock.calls.find, 1);
        assert.equal(mock.calls.persist, 1);
        assert.equal(room.completedMatchPersistenceStatus, "persisted");
        assert.equal(room.completedMatchPersistenceError, "");
        assert.equal(room.completedMatchPersistencePromise, null);
    });
});
