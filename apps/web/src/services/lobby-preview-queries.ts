import { useQuery } from "@tanstack/react-query";
import { CLASSIC_BOARD_CONFIG, MVP_MAX_PLAYERS, MVP_MIN_PLAYERS } from "@monopoly/shared-config";
import { queryKeys } from "./query-keys";

export type LobbySeatConnectionState = "connected" | "reconnect_reserved";

export interface LobbySeatPreview {
  seatNumber: number;
  playerId: string;
  displayName: string;
  isHost: boolean;
  isCurrentPlayer: boolean;
  isReady: boolean;
  connectionState: LobbySeatConnectionState;
  note: string;
}

export interface LobbyPreview {
  lobbyId: string;
  title: string;
  boardName: string;
  status: "waiting" | "starting";
  minPlayers: number;
  maxPlayers: number;
  phaseNote: string;
  seats: LobbySeatPreview[];
  createdAt: string;
}

export interface LobbyPreviewListResult {
  lobbies: LobbyPreview[];
}

export interface LobbyPreviewDetailResult {
  lobby: LobbyPreview | null;
}

interface LocalPlayerContext {
  playerId: string;
  displayName: string;
}

function createSeat(
  seatNumber: number,
  playerId: string,
  displayName: string,
  options: {
    isHost?: boolean;
    isReady?: boolean;
    isCurrentPlayer?: boolean;
    connectionState?: LobbySeatConnectionState;
    note: string;
  }
): LobbySeatPreview {
  return {
    seatNumber,
    playerId,
    displayName,
    isHost: options.isHost ?? false,
    isReady: options.isReady ?? false,
    isCurrentPlayer: options.isCurrentPlayer ?? false,
    connectionState: options.connectionState ?? "connected",
    note: options.note
  };
}

function buildLobbyPreviews(context: LocalPlayerContext): LobbyPreview[] {
  return [
    {
      lobbyId: "copper-corner",
      title: "Copper Corner",
      boardName: CLASSIC_BOARD_CONFIG.name,
      status: "waiting",
      minPlayers: MVP_MIN_PLAYERS,
      maxPlayers: MVP_MAX_PLAYERS,
      phaseNote: "Host seat is yours in this preview, so the host-start gate is visible immediately.",
      createdAt: "2026-03-30T18:10:00.000Z",
      seats: [
        createSeat(1, context.playerId, context.displayName, {
          isHost: true,
          isReady: false,
          isCurrentPlayer: true,
          note: "You are the host in this preview room. Ready up to unlock the start button."
        }),
        createSeat(2, "seed-binh", "Binh", {
          isReady: true,
          note: "Already ready and waiting for the host to start the table."
        }),
        createSeat(3, "seed-giang", "Giang", {
          isReady: true,
          note: "Watching the roster and keeping one eye on the first property set."
        }),
        createSeat(4, "seed-dung", "Dung", {
          isReady: true,
          note: "Confirmed and ready to move as soon as the room launches."
        })
      ]
    },
    {
      lobbyId: "harbor-club",
      title: "Harbor Club",
      boardName: CLASSIC_BOARD_CONFIG.name,
      status: "waiting",
      minPlayers: MVP_MIN_PLAYERS,
      maxPlayers: MVP_MAX_PLAYERS,
      phaseNote: "This room highlights reconnect-safe messaging with one reserved seat still held.",
      createdAt: "2026-03-30T18:16:00.000Z",
      seats: [
        createSeat(1, "seed-binh", "Binh", {
          isHost: true,
          isReady: true,
          note: "Host is waiting for the reconnect window to settle before starting."
        }),
        createSeat(2, "seed-chi", "Chi", {
          isReady: true,
          note: "Locked in and ready."
        }),
        createSeat(3, context.playerId, context.displayName, {
          isReady: false,
          isCurrentPlayer: true,
          note: "You are seated here as a guest and can still toggle ready-state."
        }),
        createSeat(4, "seed-huy", "Huy", {
          isReady: true,
          note: "Keeping the room filled while the reconnect window is open."
        }),
        createSeat(5, "seed-reconnect", "Reserved Seat", {
          isReady: true,
          connectionState: "reconnect_reserved",
          note: "Reconnect reservation is active for a returning player."
        })
      ]
    },
    {
      lobbyId: "marble-night",
      title: "Marble Night",
      boardName: CLASSIC_BOARD_CONFIG.name,
      status: "starting",
      minPlayers: MVP_MIN_PLAYERS,
      maxPlayers: MVP_MAX_PLAYERS,
      phaseNote: "A nearly full room that shows the high-energy end of the pre-match flow.",
      createdAt: "2026-03-30T18:24:00.000Z",
      seats: [
        createSeat(1, "seed-chi", "Chi", {
          isHost: true,
          isReady: true,
          note: "Host is aligning final confirmations."
        }),
        createSeat(2, context.playerId, context.displayName, {
          isReady: true,
          isCurrentPlayer: true,
          note: "You are already ready in this preview."
        }),
        createSeat(3, "seed-giang", "Giang", {
          isReady: true,
          note: "Prepared for an aggressive opening."
        }),
        createSeat(4, "seed-binh", "Binh", {
          isReady: false,
          note: "Still reviewing the room before committing."
        }),
        createSeat(5, "seed-dung", "Dung", {
          isReady: true,
          note: "Ready and keeping the table full."
        }),
        createSeat(6, "seed-an", "An", {
          isReady: true,
          note: "Final seat filled for a crowded start."
        })
      ]
    }
  ];
}

function normalizeLocalPlayerContext(context: Partial<LocalPlayerContext>): LocalPlayerContext {
  return {
    playerId: context.playerId?.trim() || "preview-player",
    displayName: context.displayName?.trim() || "Guest Host"
  };
}

export async function fetchLobbyPreviews(
  context: Partial<LocalPlayerContext>
): Promise<LobbyPreviewListResult> {
  const normalizedContext = normalizeLocalPlayerContext(context);

  return {
    lobbies: buildLobbyPreviews(normalizedContext)
  };
}

export async function fetchLobbyPreviewDetail(
  lobbyId: string,
  context: Partial<LocalPlayerContext>
): Promise<LobbyPreviewDetailResult> {
  const normalizedContext = normalizeLocalPlayerContext(context);
  const lobby = buildLobbyPreviews(normalizedContext).find((entry) => entry.lobbyId === lobbyId) ?? null;

  return {
    lobby
  };
}

export function useLobbyPreviewListQuery(context: Partial<LocalPlayerContext>) {
  const normalizedContext = normalizeLocalPlayerContext(context);

  return useQuery({
    queryKey: queryKeys.lobbies.list(normalizedContext.playerId, normalizedContext.displayName),
    queryFn: () => fetchLobbyPreviews(normalizedContext)
  });
}

export function useLobbyPreviewDetailQuery(
  lobbyId: string | null,
  context: Partial<LocalPlayerContext>
) {
  const normalizedContext = normalizeLocalPlayerContext(context);

  return useQuery({
    enabled: typeof lobbyId === "string" && lobbyId.length > 0,
    queryKey: queryKeys.lobbies.detail(lobbyId ?? "missing", normalizedContext.playerId, normalizedContext.displayName),
    queryFn: () => fetchLobbyPreviewDetail(lobbyId ?? "", normalizedContext)
  });
}