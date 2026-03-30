import { MVP_MAX_PLAYERS, MVP_RECONNECT_TIMEOUT_MS } from "@monopoly/shared-config";
import {
  CloseCode,
  ErrorCode,
  Room,
  ServerError,
  type Client
} from "colyseus";
import type { MatchJoinOptions, TurnPhase } from "@monopoly/shared-types";
import type { MatchEliminationRecord } from "../persistence/index.js";
import { createGameMessageHandlers } from "../handlers/index.js";
import {
  createEmptyMonopolyRoomState,
  createMatchPlayerFromJoinOptions,
  type MonopolyRoomCreateOptions,
  type MonopolyRoomStateSchema
} from "../schemas/index.js";
import {
  initializeMonopolyRoomState,
  markPlayerReconnected,
  reservePlayerReconnectSlot,
  resolvePlayerAbandonment,
  syncIdleTurnTimeout,
  syncMonopolyRoomMetadata
} from "../services/index.js";

function createJoinError(code: number, message: string): ServerError {
  return new ServerError(code, message);
}

interface IdleTurnTimeoutHandle {
  clear(): void;
}

interface IdleTurnContext {
  playerId: string;
  phase: TurnPhase;
  turnNumber: number;
}

export class MonopolyRoom extends Room<{ state: MonopolyRoomStateSchema }> {
  override state = createEmptyMonopolyRoomState();
  override messages = {};
  idleTurnTimeout: IdleTurnTimeoutHandle | null = null;
  idleTurnTimeoutContext: IdleTurnContext | null = null;
  eliminationTimeline: MatchEliminationRecord[] = [];
  nextEliminationSequence = 1;
  completedMatchPersistencePromise: Promise<void> | null = null;
  completedMatchPersistenceStatus:
    | "idle"
    | "persisting"
    | "persisted"
    | "failed"
    | "skipped_not_configured" = "idle";
  completedMatchPersistenceError = "";

  override onCreate(options: MonopolyRoomCreateOptions = {}): void {
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

  override onJoin(client: Client, options: MatchJoinOptions): void {
    const playerId = options?.playerId ?? client.sessionId;
    const joinMatchId = options?.matchId ?? "";

    if (joinMatchId !== "" && joinMatchId !== this.state.matchId) {
      throw createJoinError(
        ErrorCode.MATCHMAKE_INVALID_ROOM_ID,
        `Join attempt targeted match ${joinMatchId}, but this room is ${this.state.matchId}.`
      );
    }

    client.userData = {
      ...(client.userData ?? {}),
      playerId
    };

    let player = this.state.players.get(playerId);
    const allowDevBootstrap = this.state.players.size === 0 && this.state.status !== "finished";

    if (!player) {
      if (!allowDevBootstrap) {
        throw createJoinError(
          ErrorCode.MATCHMAKE_EXPIRED,
          "Player is not part of this active match room."
        );
      }

      player = createMatchPlayerFromJoinOptions(
        {
          playerId,
          matchId: options?.matchId ?? this.state.matchId,
          reconnectToken: options?.reconnectToken
        },
        1
      );
      this.state.players.set(playerId, player);
    } else {
      if (player.connection.status === "abandoned") {
        throw createJoinError(
          ErrorCode.MATCHMAKE_EXPIRED,
          "This player seat is no longer reclaimable."
        );
      }

      if (
        (player.connection.status === "connected" || player.connection.status === "reconnected") &&
        !allowDevBootstrap
      ) {
        throw createJoinError(
          ErrorCode.MATCHMAKE_UNHANDLED,
          "This player seat is already controlled by an active connection."
        );
      }

      if (
        player.connection.status === "disconnected_reserved" &&
        player.connection.reconnectDeadlineAt > 0 &&
        player.connection.reconnectDeadlineAt <= Date.now()
      ) {
        throw createJoinError(
          ErrorCode.MATCHMAKE_EXPIRED,
          "The reconnect window for this player seat has expired."
        );
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

  override async onDrop(client: Client, _code: number): Promise<void> {
    const playerId = String(client.userData?.playerId ?? "");
    const reserved = reservePlayerReconnectSlot(
      this,
      playerId,
      Date.now() + MVP_RECONNECT_TIMEOUT_MS
    );

    if (!reserved) {
      return;
    }

    try {
      await this.allowReconnection(client, Math.ceil(MVP_RECONNECT_TIMEOUT_MS / 1000));
    } catch {
      resolvePlayerAbandonment(this, playerId, {
        now: Date.now(),
        cause: "reconnect_expired"
      });
    }
  }

  override onReconnect(client: Client): void {
    const playerId = String(client.userData?.playerId ?? "");
    markPlayerReconnected(this, playerId);
  }

  override onLeave(client: Client, code: number): void {
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
