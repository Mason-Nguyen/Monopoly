import type { PlayerIdentity } from "@monopoly/shared-types";
import { MonopolyRoom } from "../../src/rooms/MonopolyRoom.js";
import { attachBroadcastRecorder } from "./broadcasts.js";

export const DEFAULT_TEST_PLAYERS: PlayerIdentity[] = [
  { playerId: "p1", displayName: "Player 1", isGuest: true },
  { playerId: "p2", displayName: "Player 2", isGuest: true },
  { playerId: "p3", displayName: "Player 3", isGuest: true },
  { playerId: "p4", displayName: "Player 4", isGuest: true }
];

export interface CreateSeededRoomOptions {
  players?: PlayerIdentity[];
  startedAt?: number;
  sourceLobbyId?: string;
  matchId?: string;
}

function seedRoomListing(room: MonopolyRoom): void {
  (room as unknown as { _listing: Record<string, unknown> })._listing = {
    metadata: {},
    clients: 0,
    locked: false,
    private: false,
    maxClients: room.maxClients,
    roomId: "test-room"
  };
}

export function createSeededMonopolyRoom(options: CreateSeededRoomOptions = {}) {
  const room = new MonopolyRoom();
  seedRoomListing(room);
  room.onCreate({
    players: options.players ?? DEFAULT_TEST_PLAYERS,
    startedAt: options.startedAt ?? 1_700_000_000_000,
    sourceLobbyId: options.sourceLobbyId ?? "test-lobby",
    matchId: options.matchId
  });

  return {
    room,
    broadcastRecorder: attachBroadcastRecorder(room)
  };
}
