import type { Room } from "colyseus.js";

let activeLobbyRoom: Room<any> | null = null;

export function getActiveLobbyRoom(roomId: string | null | undefined = null) {
  if (activeLobbyRoom === null) {
    return null;
  }

  if (roomId && activeLobbyRoom.roomId !== roomId) {
    return null;
  }

  return activeLobbyRoom;
}

export function registerActiveLobbyRoom(room: Room<any>) {
  activeLobbyRoom = room;
  return room;
}

export function clearActiveLobbyRoom(roomId: string | null | undefined = null) {
  if (activeLobbyRoom === null) {
    return;
  }

  if (roomId && activeLobbyRoom.roomId !== roomId) {
    return;
  }

  activeLobbyRoom = null;
}