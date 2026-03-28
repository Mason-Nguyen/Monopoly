function createPrefixedId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createLobbyId(): string {
  return createPrefixedId("lobby");
}

export function createMatchId(): string {
  return createPrefixedId("match");
}