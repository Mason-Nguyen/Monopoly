import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useParams } from "react-router-dom";
import type { Room } from "colyseus.js";
import type { MonopolyRoomState } from "@monopoly/shared-types";
import {
  GAME_BUY_PROPERTY_COMMAND,
  GAME_DICE_ROLLED_EVENT,
  GAME_END_TURN_COMMAND,
  GAME_ERROR_EVENT,
  GAME_PAYMENT_APPLIED_EVENT,
  GAME_PLAYER_CONNECTION_CHANGED_EVENT,
  GAME_PLAYER_ELIMINATED_EVENT,
  GAME_PLAYER_MOVED_EVENT,
  GAME_PROPERTY_PURCHASED_EVENT,
  GAME_RESULT_READY_EVENT,
  GAME_ROLL_DICE_COMMAND,
  GAME_TILE_RESOLVED_EVENT
} from "@monopoly/shared-types";
import { getColyseusClient } from "../../services";
import type { MatchShellPreview } from "../../services/match-shell-preview-queries";
import {
  appendFeedEntry,
  createMatchFeedEntryFromEvent,
  projectLiveMatchShellPreview,
  serializeRoomState
} from "../../services/live-room-projections";
import { useSessionStore } from "../../stores";

interface LiveMatchRoomContextValue {
  isLive: boolean;
  status: "idle" | "connecting" | "connected" | "error";
  preview: MatchShellPreview | null;
  roomId: string | null;
  error: Error | null;
  sendRollDice(): Promise<void>;
  sendBuyProperty(): Promise<void>;
  sendEndTurn(): Promise<void>;
}

const LiveMatchRoomContext = createContext<LiveMatchRoomContextValue | null>(null);

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Unexpected live match error.");
}

export function LiveMatchRoomProvider({ children }: PropsWithChildren) {
  const { matchId } = useParams();
  const playerId = useSessionStore((state) => state.playerId);
  const displayName = useSessionStore((state) => state.displayName);
  const lastMatchId = useSessionStore((state) => state.lastMatchId);
  const lastMatchRoomId = useSessionStore((state) => state.lastMatchRoomId);
  const lastMatchReconnectToken = useSessionStore((state) => state.lastMatchReconnectToken);
  const setLastMatchId = useSessionStore((state) => state.setLastMatchId);
  const setLastMatchRoomId = useSessionStore((state) => state.setLastMatchRoomId);
  const setLastMatchReconnectToken = useSessionStore((state) => state.setLastMatchReconnectToken);

  const roomRef = useRef<Room<any> | null>(null);
  const snapshotRef = useRef<MonopolyRoomState | null>(null);
  const [snapshot, setSnapshot] = useState<MonopolyRoomState | null>(null);
  const [feed, setFeed] = useState<MatchShellPreview["feed"]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId || !playerId) {
      setStatus("idle");
      setSnapshot(null);
      snapshotRef.current = null;
      setFeed([]);
      setRoomId(null);
      setError(null);
      return;
    }

    let disposed = false;

    async function connect() {
      setStatus("connecting");
      setError(null);
      setFeed([]);

      let room: Room<any> | null = null;
      const activeMatchId = matchId ?? "";
      const canResumeStoredMatch = lastMatchId === activeMatchId;

      try {
        if (canResumeStoredMatch && lastMatchReconnectToken) {
          try {
            room = await getColyseusClient().reconnect(lastMatchReconnectToken);
          } catch {
            room = null;
          }
        }

        if (!room && canResumeStoredMatch && lastMatchRoomId) {
          room = await getColyseusClient().joinById(lastMatchRoomId, {
            playerId,
            matchId: activeMatchId
          });
        }

        if (!room && canResumeStoredMatch) {
          room = await getColyseusClient().joinOrCreate("monopoly", {
            playerId,
            matchId: activeMatchId
          });
        }

        if (!room) {
          setStatus("idle");
          return;
        }

        if (disposed) {
          void room.leave();
          return;
        }

        roomRef.current = room;
        setRoomId(room.roomId);
        setLastMatchId(activeMatchId);
        setLastMatchRoomId(room.roomId);
        setLastMatchReconnectToken(room.reconnectionToken ?? null);

        const applySnapshot = (nextState: unknown) => {
          const serialized = serializeRoomState<MonopolyRoomState>(nextState);
          snapshotRef.current = serialized;
          setSnapshot(serialized);
          setStatus("connected");
          setRoomId(room?.roomId ?? null);

          if (room?.reconnectionToken) {
            setLastMatchReconnectToken(room.reconnectionToken);
          }
        };

        applySnapshot(room.state);

        room.onStateChange((nextState) => {
          if (!disposed) {
            applySnapshot(nextState);
          }
        });

        const bindFeedEvent = (eventName: string) => {
          room?.onMessage(eventName, (payload: unknown) => {
            if (disposed) {
              return;
            }

            setFeed((current) =>
              appendFeedEntry(
                current,
                createMatchFeedEntryFromEvent(eventName, payload, snapshotRef.current)
              )
            );
          });
        };

        [
          GAME_DICE_ROLLED_EVENT,
          GAME_PLAYER_MOVED_EVENT,
          GAME_TILE_RESOLVED_EVENT,
          GAME_PAYMENT_APPLIED_EVENT,
          GAME_PROPERTY_PURCHASED_EVENT,
          GAME_PLAYER_CONNECTION_CHANGED_EVENT,
          GAME_PLAYER_ELIMINATED_EVENT,
          GAME_RESULT_READY_EVENT,
          GAME_ERROR_EVENT
        ].forEach(bindFeedEvent);

        room.onError((_, message) => {
          if (!disposed) {
            setStatus("error");
            setError(new Error(message || "Live match connection failed."));
          }
        });

        room.onLeave(() => {
          if (!disposed) {
            setStatus("idle");
          }
        });
      } catch (connectionError) {
        if (!disposed) {
          setStatus("error");
          setError(toError(connectionError));
          setSnapshot(null);
          snapshotRef.current = null;
        }
      }
    }

    void connect();

    return () => {
      disposed = true;
      const room = roomRef.current;
      roomRef.current = null;
      setSnapshot(null);
      snapshotRef.current = null;
      setFeed([]);
      setRoomId(null);

      if (room) {
        void room.leave();
      }
    };
  }, [
    displayName,
    lastMatchId,
    lastMatchReconnectToken,
    lastMatchRoomId,
    matchId,
    playerId,
    setLastMatchId,
    setLastMatchReconnectToken,
    setLastMatchRoomId
  ]);

  async function sendRollDice() {
    const room = roomRef.current;
    if (!room) {
      throw new Error("Live match room is not connected.");
    }

    room.send(GAME_ROLL_DICE_COMMAND, {});
  }

  async function sendBuyProperty() {
    const room = roomRef.current;
    const currentSnapshot = snapshotRef.current;

    if (!room || !currentSnapshot) {
      throw new Error("Live match room is not connected.");
    }

    const property = Object.values(currentSnapshot.board.properties).find(
      (entry) => entry.tileIndex === currentSnapshot.turn.currentTileIndex
    );

    if (!property) {
      throw new Error("No live property is available for purchase right now.");
    }

    room.send(GAME_BUY_PROPERTY_COMMAND, {
      propertyId: property.propertyId
    });
  }

  async function sendEndTurn() {
    const room = roomRef.current;
    if (!room) {
      throw new Error("Live match room is not connected.");
    }

    room.send(GAME_END_TURN_COMMAND, {});
  }

  const preview = snapshot
    ? projectLiveMatchShellPreview(snapshot, playerId, displayName, feed, status, error?.message ?? null)
    : null;

  return (
    <LiveMatchRoomContext.Provider
      value={{
        isLive: preview !== null,
        status,
        preview,
        roomId,
        error,
        sendRollDice,
        sendBuyProperty,
        sendEndTurn
      }}
    >
      {children}
    </LiveMatchRoomContext.Provider>
  );
}

export function useLiveMatchRoom() {
  const context = useContext(LiveMatchRoomContext);

  if (!context) {
    throw new Error("useLiveMatchRoom must be used inside LiveMatchRoomProvider.");
  }

  return context;
}