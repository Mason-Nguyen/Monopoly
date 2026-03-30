import { GAME_PLAYER_CONNECTION_CHANGED_EVENT } from "@monopoly/shared-types";
import type { MonopolyRoom } from "../rooms/MonopolyRoom.js";
import { processMonopolyRoomTransition } from "./completed-match-persistence.js";
import { syncMonopolyRoomMetadata } from "./gameplay-event-broadcast.js";
import { syncIdleTurnTimeout } from "./idle-turn.js";
import { executeEngineLifecycleOutcomeForMonopolyRoomState } from "./engine-lifecycle-execution.js";

export type PlayerAbandonmentCause = "reconnect_expired" | "consented_leave";

function broadcastPlayerConnectionChanged(room: MonopolyRoom, playerId: string): void {
  const player = room.state.players.get(playerId);

  if (!player) {
    return;
  }

  room.broadcast(
    GAME_PLAYER_CONNECTION_CHANGED_EVENT,
    {
      playerId,
      status: player.connection.status,
      ...(player.connection.reconnectDeadlineAt > 0
        ? { reconnectDeadlineAt: player.connection.reconnectDeadlineAt }
        : {})
    },
    { afterNextPatch: true }
  );
}

export function reservePlayerReconnectSlot(
  room: MonopolyRoom,
  playerId: string,
  reconnectDeadlineAt: number
): boolean {
  const player = room.state.players.get(playerId);

  if (!player || player.connection.status === "abandoned") {
    return false;
  }

  player.connection.status = "disconnected_reserved";
  player.connection.reconnectDeadlineAt = reconnectDeadlineAt;

  syncMonopolyRoomMetadata(room);
  syncIdleTurnTimeout(room);
  broadcastPlayerConnectionChanged(room, playerId);
  return true;
}

export function markPlayerReconnected(room: MonopolyRoom, playerId: string): boolean {
  const player = room.state.players.get(playerId);

  if (!player || player.connection.status === "abandoned") {
    return false;
  }

  player.connection.status = "reconnected";
  player.connection.reconnectDeadlineAt = 0;

  syncMonopolyRoomMetadata(room);
  syncIdleTurnTimeout(room);
  broadcastPlayerConnectionChanged(room, playerId);
  return true;
}

export interface ResolvePlayerAbandonmentOptions {
  now?: number;
  cause?: PlayerAbandonmentCause;
}

export function resolvePlayerAbandonment(
  room: MonopolyRoom,
  playerId: string,
  options: ResolvePlayerAbandonmentOptions = {}
): boolean {
  const player = room.state.players.get(playerId);

  if (!player) {
    return false;
  }

  const shouldBroadcastConnectionChange =
    player.connection.status !== "abandoned" || player.connection.reconnectDeadlineAt !== 0;
  const now = options.now ?? Date.now();

  if (room.state.status === "playing" && !player.isAbandoned && !player.isBankrupt) {
    const transitionResult = executeEngineLifecycleOutcomeForMonopolyRoomState(
      room.state,
      {
        type: "abandon_player",
        playerId,
        reason: "abandoned"
      },
      { now }
    );

    const updatedPlayer = room.state.players.get(playerId);

    if (updatedPlayer) {
      updatedPlayer.connection.status = "abandoned";
      updatedPlayer.connection.reconnectDeadlineAt = 0;
    }

    syncMonopolyRoomMetadata(room);

    if (shouldBroadcastConnectionChange) {
      broadcastPlayerConnectionChanged(room, playerId);
    }

    processMonopolyRoomTransition(room, transitionResult, { now });
    syncIdleTurnTimeout(room);
    return true;
  }

  player.connection.status = "abandoned";
  player.connection.reconnectDeadlineAt = 0;
  syncMonopolyRoomMetadata(room);
  syncIdleTurnTimeout(room);

  if (shouldBroadcastConnectionChange) {
    broadcastPlayerConnectionChanged(room, playerId);
  }

  return false;
}
