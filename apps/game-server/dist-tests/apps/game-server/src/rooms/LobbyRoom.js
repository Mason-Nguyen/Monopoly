import { MVP_MAX_PLAYERS } from "@monopoly/shared-config";
import { Room } from "colyseus";
import { createLobbyMessageHandlers, syncLobbyState } from "../handlers/index.js";
import { createLobbyPlayerState, createLobbyRoomState } from "../schemas/index.js";
export class LobbyRoom extends Room {
    constructor() {
        super(...arguments);
        this.state = createLobbyRoomState();
        this.messages = {};
    }
    refreshMetadata() {
        void this.setMetadata({
            roomKind: "lobby",
            status: this.state.status,
            playerCount: this.state.playerCount,
            canStartMatch: this.state.canStartMatch
        });
    }
    onCreate(options = {}) {
        this.maxClients = options.maxPlayers ?? MVP_MAX_PLAYERS;
        this.state = createLobbyRoomState(options);
        this.metadata = {
            roomKind: "lobby",
            status: this.state.status,
            playerCount: this.state.playerCount,
            canStartMatch: this.state.canStartMatch
        };
        this.messages = createLobbyMessageHandlers(this);
    }
    onJoin(client, options) {
        const fallbackPlayerId = client.sessionId;
        const playerOptions = {
            playerId: options?.playerId ?? fallbackPlayerId,
            displayName: options?.displayName ?? `Player ${this.state.players.size + 1}`,
            avatarKey: options?.avatarKey
        };
        const isHost = this.state.hostPlayerId === "" || this.state.players.size === 0;
        const player = createLobbyPlayerState(playerOptions, isHost);
        client.userData = {
            ...(client.userData ?? {}),
            playerId: player.playerId
        };
        if (isHost) {
            this.state.hostPlayerId = player.playerId;
        }
        this.state.players.set(player.playerId, player);
        syncLobbyState(this);
    }
    onLeave(client, _code) {
        const playerId = String(client.userData?.playerId ?? "");
        if (playerId === "") {
            return;
        }
        this.state.players.delete(playerId);
        if (this.state.hostPlayerId === playerId) {
            const nextHost = Array.from(this.state.players.values())[0];
            this.state.hostPlayerId = nextHost?.playerId ?? "";
            this.state.players.forEach((player) => {
                player.isHost = player.playerId === this.state.hostPlayerId;
            });
        }
        syncLobbyState(this);
    }
}
