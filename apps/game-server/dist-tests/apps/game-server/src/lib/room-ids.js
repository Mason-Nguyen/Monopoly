import { randomUUID } from "node:crypto";
function createPrefixedId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
export function createLobbyId() {
    return createPrefixedId("lobby");
}
export function createMatchId() {
    return randomUUID();
}
