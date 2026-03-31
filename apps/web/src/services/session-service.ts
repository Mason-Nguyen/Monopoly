const DISPLAY_NAME_MAX_LENGTH = 24;

const guestPrefixes = [
  "Amber",
  "Copper",
  "Elm",
  "Harbor",
  "Marble",
  "Mint",
  "North",
  "Velvet"
];

const guestSuffixes = [
  "Baron",
  "Builder",
  "Captain",
  "Dealer",
  "Host",
  "Mayor",
  "Rook",
  "Tycoon"
];

function randomFrom(values: readonly string[]): string {
  return values[Math.floor(Math.random() * values.length)] ?? "Guest";
}

export function createGuestPlayerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function createGuestDisplayName(): string {
  return `${randomFrom(guestPrefixes)} ${randomFrom(guestSuffixes)}`;
}

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, DISPLAY_NAME_MAX_LENGTH);
}

export function truncateIdentifier(
  value: string | null | undefined,
  leading = 8,
  trailing = 4
): string {
  if (!value) {
    return "unassigned";
  }

  if (value.length <= leading + trailing + 1) {
    return value;
  }

  return `${value.slice(0, leading)}...${value.slice(-trailing)}`;
}

export function createGuestSessionSnapshot() {
  return {
    playerId: createGuestPlayerId(),
    displayName: createGuestDisplayName(),
    lastLobbyId: null,
    lastMatchId: null,
    reconnectToken: null,
    lastMatchRoomId: null,
    lastMatchReconnectToken: null
  };
}