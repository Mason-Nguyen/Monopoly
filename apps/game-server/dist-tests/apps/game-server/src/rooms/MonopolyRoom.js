import { MVP_MAX_PLAYERS, MVP_RECONNECT_TIMEOUT_MS } from "@monopoly/shared-config";
import { CloseCode, ErrorCode, Room, ServerError } from "colyseus";
import { createGameMessageHandlers } from "../handlers/index.js";
import { createEmptyMonopolyRoomState, createMatchPlayerFromJoinOptions } from "../schemas/index.js";
import { initializeMonopolyRoomState, markPlayerReconnected, reservePlayerReconnectSlot, resolvePlayerAbandonment, syncIdleTurnTimeout, syncMonopolyRoomMetadata } from "../services/index.js";
function createJoinError(code, message) {
    return new ServerError(code, message);
}
export class MonopolyRoom extends Room {
    constructor() {
        super(...arguments);
        this.state = createEmptyMonopolyRoomState();
        this.messages = {};
        this.idleTurnTimeout = null;
        this.idleTurnTimeoutContext = null;
        this.eliminationTimeline = [];
        this.nextEliminationSequence = 1;
        this.completedMatchPersistencePromise = null;
        this.completedMatchPersistenceStatus = "idle";
        this.completedMatchPersistenceError = "";
    }
    onCreate(options = {}) {
        this.maxClients = MVP_MAX_PLAYERS;
        this.state = initializeMonopolyRoomState(options);
        this.metadata = {
            roomKind: "monopoly",
            status: this.state.status,
            playerCount: this.state.players.size
        };
        this.messages = createGameMessageHandlers(this);
        syncIdleTurnTimeout(this);
    }
    onJoin(client, options) {
        const playerId = options?.playerId ?? client.sessionId;
        const joinMatchId = options?.matchId ?? "";
        if (joinMatchId !== "" && joinMatchId !== this.state.matchId) {
            throw createJoinError(ErrorCode.MATCHMAKE_INVALID_ROOM_ID, `Join attempt targeted match ${joinMatchId}, but this room is ${this.state.matchId}.`);
        }
        client.userData = {
            ...(client.userData ?? {}),
            playerId
        };
        let player = this.state.players.get(playerId);
        const allowDevBootstrap = this.state.players.size === 0 && this.state.status !== "finished";
        if (!player) {
            if (!allowDevBootstrap) {
                throw createJoinError(ErrorCode.MATCHMAKE_EXPIRED, "Player is not part of this active match room.");
            }
            player = createMatchPlayerFromJoinOptions({
                playerId,
                matchId: options?.matchId ?? this.state.matchId,
                reconnectToken: options?.reconnectToken
            }, 1);
            this.state.players.set(playerId, player);
        }
        else {
            if (player.connection.status === "abandoned") {
                throw createJoinError(ErrorCode.MATCHMAKE_EXPIRED, "This player seat is no longer reclaimable.");
            }
            if ((player.connection.status === "connected" || player.connection.status === "reconnected") &&
                !allowDevBootstrap) {
                throw createJoinError(ErrorCode.MATCHMAKE_UNHANDLED, "This player seat is already controlled by an active connection.");
            }
            if (player.connection.status === "disconnected_reserved" &&
                player.connection.reconnectDeadlineAt > 0 &&
                player.connection.reconnectDeadlineAt <= Date.now()) {
                throw createJoinError(ErrorCode.MATCHMAKE_EXPIRED, "The reconnect window for this player seat has expired.");
            }
        }
        player.connection.status = "connected";
        player.connection.reconnectDeadlineAt = 0;
        syncMonopolyRoomMetadata(this);
        if (this.state.turn.activePlayerId === "") {
            this.state.turn.activePlayerId = playerId;
            this.state.turn.awaitingInput = true;
        }
        syncIdleTurnTimeout(this);
    }
    async onDrop(client, _code) {
        const playerId = String(client.userData?.playerId ?? "");
        const reserved = reservePlayerReconnectSlot(this, playerId, Date.now() + MVP_RECONNECT_TIMEOUT_MS);
        if (!reserved) {
            return;
        }
        try {
            await this.allowReconnection(client, Math.ceil(MVP_RECONNECT_TIMEOUT_MS / 1000));
        }
        catch {
            resolvePlayerAbandonment(this, playerId, {
                now: Date.now(),
                cause: "reconnect_expired"
            });
        }
    }
    onReconnect(client) {
        const playerId = String(client.userData?.playerId ?? "");
        markPlayerReconnected(this, playerId);
    }
    onLeave(client, code) {
        const consented = code === CloseCode.CONSENTED;
        if (!consented) {
            return;
        }
        const playerId = String(client.userData?.playerId ?? "");
        resolvePlayerAbandonment(this, playerId, {
            now: Date.now(),
            cause: "consented_leave"
        });
    }
}
