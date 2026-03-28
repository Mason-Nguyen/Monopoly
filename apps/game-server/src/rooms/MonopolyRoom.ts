import { MVP_MAX_PLAYERS, MVP_RECONNECT_TIMEOUT_MS } from "@monopoly/shared-config";
import { CloseCode, Room, type Client } from "colyseus";
import {
  GAME_PLAYER_CONNECTION_CHANGED_EVENT,
  type MatchJoinOptions
} from "@monopoly/shared-types";
import { createGameMessageHandlers } from "../handlers/index.js";
import {
  createMatchPlayerFromJoinOptions,
  createMonopolyRoomState,
  type MonopolyRoomCreateOptions,
  type MonopolyRoomStateSchema
} from "../schemas/index.js";

export class MonopolyRoom extends Room<{ state: MonopolyRoomStateSchema }> {
  override state = createMonopolyRoomState();
  override messages = {};

  override onCreate(options: MonopolyRoomCreateOptions = {}): void {
    this.maxClients = MVP_MAX_PLAYERS;
    this.state = createMonopolyRoomState(options);
    this.metadata = {
      roomKind: "monopoly",
      status: this.state.status
    };
    this.messages = createGameMessageHandlers(this);
  }

  override onJoin(client: Client, options: MatchJoinOptions): void {
    const playerId = options?.playerId ?? client.sessionId;
    client.userData = {
      ...(client.userData ?? {}),
      playerId
    };

    let player = this.state.players.get(playerId);
    if (!player) {
      player = createMatchPlayerFromJoinOptions(
        {
          playerId,
          matchId: options?.matchId ?? this.state.matchId,
          reconnectToken: options?.reconnectToken
        },
        this.state.players.size
      );
      this.state.players.set(playerId, player);
    }

    player.connection.status = "connected";
    player.connection.reconnectDeadlineAt = 0;

    if (this.state.turn.activePlayerId === "") {
      this.state.turn.activePlayerId = playerId;
      this.state.turn.awaitingInput = true;
    }
  }

  override async onDrop(client: Client, _code: number): Promise<void> {
    const playerId = String(client.userData?.playerId ?? "");
    const player = this.state.players.get(playerId);

    if (!player) {
      return;
    }

    player.connection.status = "disconnected_reserved";
    player.connection.reconnectDeadlineAt = Date.now() + MVP_RECONNECT_TIMEOUT_MS;

    this.broadcast(
      GAME_PLAYER_CONNECTION_CHANGED_EVENT,
      {
        playerId,
        status: player.connection.status,
        reconnectDeadlineAt: player.connection.reconnectDeadlineAt
      },
      { afterNextPatch: true }
    );

    try {
      await this.allowReconnection(client, Math.ceil(MVP_RECONNECT_TIMEOUT_MS / 1000));
    } catch {
      player.isAbandoned = true;
      player.connection.status = "abandoned";
      player.connection.reconnectDeadlineAt = 0;

      this.broadcast(
        GAME_PLAYER_CONNECTION_CHANGED_EVENT,
        {
          playerId,
          status: player.connection.status
        },
        { afterNextPatch: true }
      );
    }
  }

  override onReconnect(client: Client): void {
    const playerId = String(client.userData?.playerId ?? "");
    const player = this.state.players.get(playerId);

    if (!player) {
      return;
    }

    player.connection.status = "reconnected";
    player.connection.reconnectDeadlineAt = 0;

    this.broadcast(
      GAME_PLAYER_CONNECTION_CHANGED_EVENT,
      {
        playerId,
        status: player.connection.status
      },
      { afterNextPatch: true }
    );
  }

  override onLeave(client: Client, code: number): void {
    const consented = code === CloseCode.CONSENTED;
    if (!consented) {
      return;
    }

    const playerId = String(client.userData?.playerId ?? "");
    const player = this.state.players.get(playerId);

    if (!player) {
      return;
    }

    player.isAbandoned = true;
    player.connection.status = "abandoned";
    player.connection.reconnectDeadlineAt = 0;

    this.broadcast(
      GAME_PLAYER_CONNECTION_CHANGED_EVENT,
      {
        playerId,
        status: player.connection.status
      },
      { afterNextPatch: true }
    );
  }
}