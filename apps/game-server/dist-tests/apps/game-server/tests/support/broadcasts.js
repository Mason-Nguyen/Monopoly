export function attachBroadcastRecorder(room) {
    const broadcasts = [];
    const originalBroadcast = room.broadcast.bind(room);
    room.broadcast = ((eventName, payload, options) => {
        broadcasts.push({
            eventName,
            payload,
            options
        });
    });
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
export function getBroadcastPayloads(recorder, eventName) {
    return recorder.broadcasts
        .filter((record) => record.eventName === eventName)
        .map((record) => record.payload);
}
