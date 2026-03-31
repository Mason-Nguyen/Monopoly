import { useQuery } from "@tanstack/react-query";
import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import { queryKeys } from "./query-keys";

export type MatchFeedKind = "turn" | "payment" | "property" | "connection";

export interface MatchShellPlayerPreview {
  playerId: string;
  displayName: string;
  balance: number;
  position: number;
  ownedPropertyCount: number;
  status: "active" | "waiting" | "reconnect_reserved";
  isCurrentPlayer: boolean;
  isActiveTurn: boolean;
}

export interface MatchShellActionPreview {
  id: "roll_dice" | "buy_property" | "end_turn";
  label: string;
  description: string;
  enabled: boolean;
  tone: "primary" | "secondary" | "ghost";
}

export interface MatchFeedEntryPreview {
  id: string;
  kind: MatchFeedKind;
  title: string;
  detail: string;
  timestampLabel: string;
}

export interface MatchShellPreview {
  matchId: string;
  status: "playing" | "finished";
  turnNumber: number;
  phaseLabel: string;
  activePlayerId: string;
  currentTileName: string;
  currentTileType: string;
  players: MatchShellPlayerPreview[];
  actions: MatchShellActionPreview[];
  feed: MatchFeedEntryPreview[];
  boardWindow: Array<{
    tileIndex: number;
    name: string;
    tileType: string;
  }>;
  connectionBanner: {
    tone: "info" | "warn";
    title: string;
    detail: string;
  } | null;
  economy: {
    localBalance: number;
    ownedPropertyCount: number;
    nextBuyOpportunity: string;
    nextBuyCost: number | null;
  };
}

interface LocalPlayerContext {
  playerId: string;
  displayName: string;
}

function normalizeLocalPlayerContext(context: Partial<LocalPlayerContext>): LocalPlayerContext {
  return {
    playerId: context.playerId?.trim() || "preview-player",
    displayName: context.displayName?.trim() || "Guest Host"
  };
}

function createBoardWindow(centerIndex: number) {
  const tiles = CLASSIC_BOARD_CONFIG.tiles;

  if (tiles.length === 0) {
    return [];
  }

  return Array.from({ length: 9 }, (_, offset) => {
    const tileIndex = (centerIndex - 2 + offset + tiles.length) % tiles.length;
    const tile = tiles[tileIndex] ?? tiles[0]!;

    return {
      tileIndex: tile.tileIndex,
      name: tile.name,
      tileType: tile.tileType
    };
  });
}

function buildCopperPreview(context: LocalPlayerContext, matchId: string): MatchShellPreview {
  const players: MatchShellPlayerPreview[] = [
    {
      playerId: context.playerId,
      displayName: context.displayName,
      balance: 1360,
      position: 7,
      ownedPropertyCount: 1,
      status: "active",
      isCurrentPlayer: true,
      isActiveTurn: true
    },
    {
      playerId: "seed-binh",
      displayName: "Binh",
      balance: 1510,
      position: 11,
      ownedPropertyCount: 2,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    },
    {
      playerId: "seed-giang",
      displayName: "Giang",
      balance: 1420,
      position: 5,
      ownedPropertyCount: 1,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    },
    {
      playerId: "seed-dung",
      displayName: "Dung",
      balance: 1490,
      position: 3,
      ownedPropertyCount: 0,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    }
  ];

  return {
    matchId,
    status: "playing",
    turnNumber: 8,
    phaseLabel: "Await Roll",
    activePlayerId: context.playerId,
    currentTileName: "Chance Lane",
    currentTileType: "neutral",
    players,
    actions: [
      {
        id: "roll_dice",
        label: "Roll Dice",
        description: "Authoritative server roll for the active turn.",
        enabled: true,
        tone: "primary"
      },
      {
        id: "buy_property",
        label: "Buy Property",
        description: "No purchasable tile is active before the roll resolves.",
        enabled: false,
        tone: "ghost"
      },
      {
        id: "end_turn",
        label: "End Turn",
        description: "Turn cannot end until the roll and tile resolution finish.",
        enabled: false,
        tone: "ghost"
      }
    ],
    feed: [
      {
        id: "feed-1",
        kind: "turn",
        title: `Turn 8 started for ${context.displayName}`,
        detail: "The local player is the active seat and can roll immediately.",
        timestampLabel: "Now"
      },
      {
        id: "feed-2",
        kind: "payment",
        title: "Binh collected rent",
        detail: "Giang just paid a light property rent before the active turn rotated.",
        timestampLabel: "20s ago"
      },
      {
        id: "feed-3",
        kind: "property",
        title: "Mediterranean purchased",
        detail: "The opening property set is already starting to close up.",
        timestampLabel: "1m ago"
      }
    ],
    boardWindow: createBoardWindow(7),
    connectionBanner: {
      tone: "info",
      title: "Connection stable",
      detail: "The preview assumes the local seat is fully connected and waiting for the next command."
    },
    economy: {
      localBalance: 1360,
      ownedPropertyCount: 1,
      nextBuyOpportunity: "Awaiting next tile result",
      nextBuyCost: null
    }
  };
}

function buildHarborPreview(context: LocalPlayerContext, matchId: string): MatchShellPreview {
  const players: MatchShellPlayerPreview[] = [
    {
      playerId: "seed-binh",
      displayName: "Binh",
      balance: 1285,
      position: 16,
      ownedPropertyCount: 3,
      status: "active",
      isCurrentPlayer: false,
      isActiveTurn: true
    },
    {
      playerId: context.playerId,
      displayName: context.displayName,
      balance: 1470,
      position: 10,
      ownedPropertyCount: 1,
      status: "waiting",
      isCurrentPlayer: true,
      isActiveTurn: false
    },
    {
      playerId: "seed-chi",
      displayName: "Chi",
      balance: 1395,
      position: 14,
      ownedPropertyCount: 2,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    },
    {
      playerId: "seed-reserved",
      displayName: "Reserved Seat",
      balance: 1320,
      position: 9,
      ownedPropertyCount: 1,
      status: "reconnect_reserved",
      isCurrentPlayer: false,
      isActiveTurn: false
    }
  ];

  return {
    matchId,
    status: "playing",
    turnNumber: 11,
    phaseLabel: "Await Optional Action",
    activePlayerId: "seed-binh",
    currentTileName: "Illinois Avenue",
    currentTileType: "property",
    players,
    actions: [
      {
        id: "roll_dice",
        label: "Roll Dice",
        description: "Only the active player can roll while this turn is unresolved.",
        enabled: false,
        tone: "ghost"
      },
      {
        id: "buy_property",
        label: "Buy Property",
        description: "The current turn could buy the resolved property if they want it.",
        enabled: false,
        tone: "secondary"
      },
      {
        id: "end_turn",
        label: "End Turn",
        description: "The turn is still deciding on an optional buy before it can pass.",
        enabled: false,
        tone: "ghost"
      }
    ],
    feed: [
      {
        id: "feed-1",
        kind: "connection",
        title: "Reconnect seat still reserved",
        detail: "One seat remains protected while the reconnect timer is still open.",
        timestampLabel: "Now"
      },
      {
        id: "feed-2",
        kind: "turn",
        title: "Binh reached Illinois Avenue",
        detail: "The active turn is paused on the optional-buy decision.",
        timestampLabel: "12s ago"
      },
      {
        id: "feed-3",
        kind: "payment",
        title: "You passed GO earlier this round",
        detail: "The local seat already collected the salary bonus and is waiting for the turn to rotate.",
        timestampLabel: "44s ago"
      }
    ],
    boardWindow: createBoardWindow(16),
    connectionBanner: {
      tone: "warn",
      title: "Reconnect-sensitive table",
      detail: "The HUD keeps the reconnect reservation visible so the room state never feels mysterious."
    },
    economy: {
      localBalance: 1470,
      ownedPropertyCount: 1,
      nextBuyOpportunity: "Illinois Avenue",
      nextBuyCost: 240
    }
  };
}

function buildMarblePreview(context: LocalPlayerContext, matchId: string): MatchShellPreview {
  const players: MatchShellPlayerPreview[] = [
    {
      playerId: context.playerId,
      displayName: context.displayName,
      balance: 1180,
      position: 23,
      ownedPropertyCount: 3,
      status: "active",
      isCurrentPlayer: true,
      isActiveTurn: true
    },
    {
      playerId: "seed-chi",
      displayName: "Chi",
      balance: 1525,
      position: 28,
      ownedPropertyCount: 2,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    },
    {
      playerId: "seed-giang",
      displayName: "Giang",
      balance: 910,
      position: 21,
      ownedPropertyCount: 4,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    },
    {
      playerId: "seed-binh",
      displayName: "Binh",
      balance: 1320,
      position: 26,
      ownedPropertyCount: 2,
      status: "waiting",
      isCurrentPlayer: false,
      isActiveTurn: false
    }
  ];

  return {
    matchId,
    status: "playing",
    turnNumber: 15,
    phaseLabel: "Await Optional Action",
    activePlayerId: context.playerId,
    currentTileName: "Ventnor Avenue",
    currentTileType: "property",
    players,
    actions: [
      {
        id: "roll_dice",
        label: "Roll Dice",
        description: "The roll already resolved for this turn.",
        enabled: false,
        tone: "ghost"
      },
      {
        id: "buy_property",
        label: "Buy Ventnor Avenue",
        description: "This is the active optional purchase decision in the preview.",
        enabled: true,
        tone: "primary"
      },
      {
        id: "end_turn",
        label: "Skip and End Turn",
        description: "The active player can skip the buy and pass the turn.",
        enabled: true,
        tone: "secondary"
      }
    ],
    feed: [
      {
        id: "feed-1",
        kind: "property",
        title: "Ventnor Avenue is available",
        detail: "The local seat has enough cash to buy and expand its property spread.",
        timestampLabel: "Now"
      },
      {
        id: "feed-2",
        kind: "turn",
        title: `Turn 15 still belongs to ${context.displayName}`,
        detail: "This is the step where the HUD should make optional actions obvious.",
        timestampLabel: "8s ago"
      },
      {
        id: "feed-3",
        kind: "payment",
        title: "Giang paid tax",
        detail: "The last forced economy event resolved before this optional decision opened.",
        timestampLabel: "32s ago"
      }
    ],
    boardWindow: createBoardWindow(23),
    connectionBanner: {
      tone: "info",
      title: "Turn is fully synced",
      detail: "This preview highlights the optional-action branch before the board scene is added."
    },
    economy: {
      localBalance: 1180,
      ownedPropertyCount: 3,
      nextBuyOpportunity: "Ventnor Avenue",
      nextBuyCost: 260
    }
  };
}

function buildMatchShellPreview(matchId: string, context: LocalPlayerContext): MatchShellPreview {
  if (matchId.includes("harbor")) {
    return buildHarborPreview(context, matchId);
  }

  if (matchId.includes("marble")) {
    return buildMarblePreview(context, matchId);
  }

  return buildCopperPreview(context, matchId);
}

export async function fetchMatchShellPreview(
  matchId: string,
  context: Partial<LocalPlayerContext>
): Promise<MatchShellPreview> {
  const normalizedContext = normalizeLocalPlayerContext(context);
  return buildMatchShellPreview(matchId, normalizedContext);
}

export function useMatchShellPreviewQuery(matchId: string | null, context: Partial<LocalPlayerContext>) {
  const normalizedContext = normalizeLocalPlayerContext(context);

  return useQuery({
    enabled: typeof matchId === "string" && matchId.length > 0,
    queryKey: queryKeys.matchShell.preview(matchId ?? "missing", normalizedContext.playerId, normalizedContext.displayName),
    queryFn: () => fetchMatchShellPreview(matchId ?? "", normalizedContext)
  });
}