import { useEffect, useRef, useState } from "react";
import type { Room } from "colyseus.js";
import type {
  LobbyErrorEvent,
  LobbyMatchStartingEvent,
  LobbyRoomState
} from "@monopoly/shared-types";
import {
  LOBBY_ERROR_EVENT,
  LOBBY_MATCH_STARTING_EVENT,
  LOBBY_SET_READY_COMMAND,
  LOBBY_START_MATCH_COMMAND
} from "@monopoly/shared-types";
import { getColyseusClient } from "../services";
import type { LobbyPreview } from "../services/lobby-preview-queries";
import {
  clearActiveLobbyRoom,
  getActiveLobbyRoom,
  registerActiveLobbyRoom
} from "../services/live-room-registry";
import {
  projectLiveLobbyRoomPreview,
  serializeRoomState
} from "../services/live-room-projections";

interface UseLiveLobbyRoomOptions {
  lobbyId: string | null;
  playerId: string | null;
  displayName: string;
}

interface LiveLobbyRoomResult {
  isLive: boolean;
  status: "idle" | "connecting" | "connected" | "error";
  lobby: LobbyPreview | null;
  error: Error | null;
  roomId: string | null;
  matchStartingEvent: LobbyMatchStartingEvent | null;
  setReady(isReady: boolean): Promise<void>;
  startMatch(): Promise<void>;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Unexpected live lobby error.");
}

export function useLiveLobbyRoom({
  lobbyId,
  playerId,
  displayName
}: UseLiveLobbyRoomOptions): LiveLobbyRoomResult {
  const roomRef = useRef<Room<any> | null>(null);
  const [snapshot, setSnapshot] = useState<LobbyRoomState | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [matchStartingEvent, setMatchStartingEvent] = useState<LobbyMatchStartingEvent | null>(null);

  useEffect(() => {
    if (!lobbyId || !playerId) {
      setStatus("idle");
      setError(null);
      setSnapshot(null);
      setRoomId(null);
      setMatchStartingEvent(null);
      return;
    }

    let disposed = false;
    const resolvedLobbyId = lobbyId;
    const existingRoom = getActiveLobbyRoom(resolvedLobbyId);

    async function connect() {
      setStatus("connecting");
      setError(null);
      setMatchStartingEvent(null);

      try {
        const room = existingRoom ?? await getColyseusClient().joinById(resolvedLobbyId, {
          playerId,
          displayName
        });

        if (disposed) {
          void room.leave();
          return;
        }

        registerActiveLobbyRoom(room);
        roomRef.current = room;
        setRoomId(room.roomId);

        const applySnapshot = (nextState: unknown) => {
          const serialized = serializeRoomState<LobbyRoomState>(nextState);
          setSnapshot(serialized);
          setStatus("connected");
        };

        applySnapshot(room.state);

        room.onStateChange((nextState) => {
          if (!disposed) {
            applySnapshot(nextState);
          }
        });

        room.onMessage(LOBBY_ERROR_EVENT, (payload: LobbyErrorEvent) => {
          if (!disposed) {
            setError(new Error(payload.message));
          }
        });

        room.onMessage(LOBBY_MATCH_STARTING_EVENT, (payload: LobbyMatchStartingEvent) => {
          if (!disposed) {
            setMatchStartingEvent(payload);
          }
        });

        room.onError((_, message) => {
          if (!disposed) {
            setStatus("error");
            setError(new Error(message || "Live lobby connection failed."));
          }
        });

        room.onLeave(() => {
          if (!disposed) {
            setStatus("idle");
            clearActiveLobbyRoom(room.roomId);
          }
        });
      } catch (connectionError) {
        if (!disposed) {
          setStatus("error");
          setError(toError(connectionError));
          setSnapshot(null);
        }
      }
    }

    void connect();

    return () => {
      disposed = true;
      const room = roomRef.current;
      roomRef.current = null;
      setSnapshot(null);
      setRoomId(null);
      setMatchStartingEvent(null);

      if (room) {
        clearActiveLobbyRoom(room.roomId);
        void room.leave();
      }
    };
  }, [displayName, lobbyId, playerId]);

  async function setReady(isReady: boolean) {
    const room = roomRef.current;
    if (!room) {
      throw new Error("Live lobby room is not connected.");
    }

    room.send(LOBBY_SET_READY_COMMAND, { isReady });
  }

  async function startMatch() {
    const room = roomRef.current;
    if (!room) {
      throw new Error("Live lobby room is not connected.");
    }

    room.send(LOBBY_START_MATCH_COMMAND, {});
  }

  return {
    isLive: snapshot !== null,
    status,
    lobby: snapshot ? projectLiveLobbyRoomPreview(snapshot, playerId) : null,
    error,
    roomId,
    matchStartingEvent,
    setReady,
    startMatch
  };
}