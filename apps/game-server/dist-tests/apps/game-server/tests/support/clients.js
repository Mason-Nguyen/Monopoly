let nextSessionCounter = 1;
function createSessionId() {
    const sessionId = `test-session-${nextSessionCounter}`;
    nextSessionCounter += 1;
    return sessionId;
}
export function createTestClient(options = {}) {
    const sessionId = options.sessionId ?? createSessionId();
    const sentMessages = [];
    return {
        sessionId,
        userData: options.playerId ? { playerId: options.playerId } : {},
        sentMessages,
        send(eventName, payload) {
            sentMessages.push({ eventName, payload });
        }
    };
}
export function createSeededMatchJoinOptions(seed) {
    const options = {
        playerId: seed.playerId,
        matchId: seed.matchId ?? ""
    };
    if (seed.reconnectToken) {
        options.reconnectToken = seed.reconnectToken;
    }
    return options;
}
export function getSentMessages(client, eventName) {
    return client.sentMessages
        .filter((message) => message.eventName === eventName)
        .map((message) => message.payload);
}
export function resetTestClientCounter() {
    nextSessionCounter = 1;
}
