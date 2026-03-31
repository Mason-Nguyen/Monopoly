import type {
  BroadcastCapableRoom,
  BroadcastRecord,
  RoomBroadcastRecorder
} from "./contracts.js";

export function attachBroadcastRecorder(room: BroadcastCapableRoom): RoomBroadcastRecorder {
  const broadcasts: BroadcastRecord[] = [];
  const originalBroadcast = room.broadcast.bind(room);

  room.broadcast = ((eventName: string, payload: unknown, options?: { afterNextPatch?: boolean }) => {
    broadcasts.push({
      eventName,
      payload,
      options
    });
  }) as typeof room.broadcast;

  return {
    broadcasts,
    clear() {
      broadcasts.length = 0;
    },
    restore() {
      room.broadcast = originalBroadcast;
    }
  };
}

export function getBroadcastPayloads<TPayload = unknown>(
  recorder: RoomBroadcastRecorder,
  eventName: string
): TPayload[] {
  return recorder.broadcasts
    .filter((record) => record.eventName === eventName)
    .map((record) => record.payload as TPayload);
}
