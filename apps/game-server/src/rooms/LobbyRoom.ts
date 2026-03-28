import { MVP_MAX_PLAYERS } from "@monopoly/shared-config";
import type { LobbyJoinOptions } from "@monopoly/shared-types";
import { Room, type Client } from "colyseus";
import { createLobbyMessageHandlers, syncLobbyState } from "../handlers/index.js";
import {
  createLobbyPlayerState,
  createLobbyRoomState,
  type LobbyRoomCreateOptions,
  type LobbyRoomStateSchema
} from "../schemas/index.js";

export class LobbyRoom extends Room<{ state: LobbyRoomStateSchema }> {
  override state = createLobbyRoomState();
  override messages = {};

  refreshMetadata(): void {
    void this.setMetadata({
      roomKind: "lobby",
      status: this.state.status,
      playerCount: this.state.playerCount,
      canStartMatch: this.state.canStartMatch
    });
  }

  override onCreate(options: LobbyRoomCreateOptions = {}): void {
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

  override onJoin(client: Client, options: LobbyJoinOptions): void {
    const fallbackPlayerId = client.sessionId;
    const playerOptions: LobbyJoinOptions = {
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

  override onLeave(client: Client, _code: number): void {
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