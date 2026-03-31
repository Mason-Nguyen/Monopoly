import type {
  GameDiceRolledEvent,
  GamePaymentAppliedEvent,
  GamePlayerConnectionChangedEvent,
  GamePlayerEliminatedEvent,
  GamePlayerMovedEvent,
  GamePropertyPurchasedEvent,
  GameResultReadyEvent,
  GameTileResolvedEvent,
  LobbyRoomState,
  MonopolyRoomState
} from "@monopoly/shared-types";
import {
  GAME_DICE_ROLLED_EVENT,
  GAME_ERROR_EVENT,
  GAME_PAYMENT_APPLIED_EVENT,
  GAME_PLAYER_CONNECTION_CHANGED_EVENT,
  GAME_PLAYER_ELIMINATED_EVENT,
  GAME_PLAYER_MOVED_EVENT,
  GAME_PROPERTY_PURCHASED_EVENT,
  GAME_RESULT_READY_EVENT,
  GAME_TILE_RESOLVED_EVENT
} from "@monopoly/shared-types";
import type {
  LobbyPreview,
  LobbySeatPreview
} from "./lobby-preview-queries";
import type {
  MatchFeedEntryPreview,
  MatchFeedKind,
  MatchShellActionPreview,
  MatchShellPlayerPreview,
  MatchShellPreview
} from "./match-shell-preview-queries";

function formatTimestampLabel(timestamp = Date.now()): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createLobbySeatNote(seat: LobbySeatPreview): string {
  if (seat.connectionState === "reconnect_reserved") {
    return "This seat is being protected while the reconnect window is still open.";
  }

  if (seat.isHost && seat.isCurrentPlayer) {
    return "You are the live host for this lobby and control the start command.";
  }

  if (seat.isCurrentPlayer) {
    return "You are seated in this live lobby and can toggle ready-state from here.";
  }

  if (seat.isHost) {
    return "This player is the host and controls the match handoff.";
  }

  return seat.isReady
    ? "This player is already ready for live match transfer."
    : "This player is still deciding before the host can launch the room.";
}

export function serializeRoomState<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function projectLiveLobbyRoomPreview(
  snapshot: LobbyRoomState,
  currentPlayerId: string | null
): LobbyPreview {
  const seats = Object.values(snapshot.players)
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player, index): LobbySeatPreview => {
      const seat: LobbySeatPreview = {
        seatNumber: index + 1,
        playerId: player.playerId,
        displayName: player.displayName,
        isHost: player.isHost,
        isCurrentPlayer: currentPlayerId === player.playerId,
        isReady: player.isReady,
        connectionState: "connected",
        note: ""
      };

      seat.note = createLobbySeatNote(seat);
      return seat;
    });

  const readyCount = seats.filter((seat) => seat.isReady).length;
  const canStart = snapshot.canStartMatch && snapshot.status === "waiting";

  return {
    lobbyId: snapshot.lobbyId,
    title: `Live Lobby ${snapshot.lobbyId.slice(0, 8)}`,
    boardName: "Classic 40 Tiles",
    status: snapshot.status === "starting" ? "starting" : "waiting",
    minPlayers: snapshot.minPlayers,
    maxPlayers: snapshot.maxPlayers,
    phaseNote: canStart
      ? "All live seats are ready. The room is prepared for host-controlled handoff into the live match."
      : `${readyCount}/${seats.length || 0} seated players are ready in the live lobby.`,
    seats,
    createdAt: new Date(snapshot.createdAt).toISOString()
  };
}

function getPlayerLabel(snapshot: MonopolyRoomState, playerId: string | null | undefined): string {
  if (!playerId) {
    return "The bank";
  }

  return snapshot.players[playerId]?.displayName ?? playerId;
}

function resolveMatchConnectionBanner(
  snapshot: MonopolyRoomState,
  currentPlayerId: string | null,
  roomStatus: "idle" | "connecting" | "connected" | "error",
  errorMessage: string | null
) {
  if (roomStatus === "connecting") {
    return {
      tone: "info" as const,
      title: "Connecting to live room",
      detail: "The client is synchronizing with the authoritative match room."
    };
  }

  if (errorMessage) {
    return {
      tone: "warn" as const,
      title: "Live room unavailable",
      detail: errorMessage
    };
  }

  const currentPlayer = currentPlayerId ? snapshot.players[currentPlayerId] : null;
  const connectionStatus = currentPlayer?.connection.status ?? "connected";

  if (connectionStatus === "disconnected_reserved") {
    return {
      tone: "warn" as const,
      title: "Reconnect reservation active",
      detail: "The local seat is still inside the protected reconnect window."
    };
  }

  if (connectionStatus === "reconnected") {
    return {
      tone: "info" as const,
      title: "Session restored",
      detail: "The local seat successfully reclaimed the live room connection."
    };
  }

  return {
    tone: "info" as const,
    title: "Connected to live room",
    detail: "The HUD is now projecting directly from Colyseus room state and event flow."
  };
}

function createBoardWindow(snapshot: MonopolyRoomState, centerIndex: number) {
  const tiles = snapshot.board.tiles;

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

function createDefaultFeed(snapshot: MonopolyRoomState, currentPlayerId: string | null): MatchFeedEntryPreview[] {
  const activePlayerLabel = getPlayerLabel(snapshot, snapshot.turn.activePlayerId);
  const localPlayerLabel = getPlayerLabel(snapshot, currentPlayerId);

  return [
    {
      id: `state-turn-${snapshot.turn.turnNumber}`,
      kind: "turn",
      title: `Turn ${snapshot.turn.turnNumber} belongs to ${activePlayerLabel}`,
      detail: `${localPlayerLabel} is reading directly from live room state while the board scene is still DOM-first.`,
      timestampLabel: formatTimestampLabel()
    }
  ];
}

function createMatchActions(
  snapshot: MonopolyRoomState,
  currentPlayerId: string | null,
  currentTileName: string
): MatchShellActionPreview[] {
  const isLocalTurn = snapshot.turn.activePlayerId !== "" && snapshot.turn.activePlayerId === currentPlayerId;
  const canRoll = isLocalTurn && snapshot.turn.phase === "await_roll";
  const canBuy = isLocalTurn && snapshot.turn.phase === "await_optional_action" && snapshot.turn.canBuyCurrentProperty;
  const canEnd = isLocalTurn && (snapshot.turn.phase === "await_optional_action" || snapshot.turn.phase === "await_end_turn");

  return [
    {
      id: "roll_dice",
      label: "Roll Dice",
      description: canRoll
        ? "The live room is waiting on the authoritative dice command."
        : "Roll is unavailable until the local seat owns the active turn and the room reaches await_roll.",
      enabled: canRoll,
      tone: canRoll ? "primary" : "ghost"
    },
    {
      id: "buy_property",
      label: canBuy ? `Buy ${currentTileName}` : "Buy Property",
      description: canBuy
        ? "The current tile is available and the room is inside the optional-buy window."
        : "Buy only unlocks when the room resolves an available property for the active player.",
      enabled: canBuy,
      tone: canBuy ? "primary" : "ghost"
    },
    {
      id: "end_turn",
      label: canBuy ? "Skip and End Turn" : "End Turn",
      description: canEnd
        ? "The live room is ready for the turn to advance."
        : "End turn stays locked until the room reaches its end-turn phase for the local seat.",
      enabled: canEnd,
      tone: canEnd ? "secondary" : "ghost"
    }
  ];
}

export function projectLiveMatchShellPreview(
  snapshot: MonopolyRoomState,
  currentPlayerId: string | null,
  _currentDisplayName: string,
  feed: MatchFeedEntryPreview[],
  roomStatus: "idle" | "connecting" | "connected" | "error",
  errorMessage: string | null
): MatchShellPreview {
  const players = Object.values(snapshot.players).sort((left, right) => left.turnOrder - right.turnOrder);
  const activePlayer = players.find((player) => player.playerId === snapshot.turn.activePlayerId) ?? null;
  const currentPlayer = currentPlayerId ? snapshot.players[currentPlayerId] ?? null : null;
  const resolvedCurrentTileIndex = typeof snapshot.turn.currentTileIndex === "number"
    ? snapshot.turn.currentTileIndex
    : -1;
  const centerTileIndex = resolvedCurrentTileIndex >= 0
    ? resolvedCurrentTileIndex
    : activePlayer?.position ?? currentPlayer?.position ?? 0;
  const currentTile = snapshot.board.tiles.find((tile) => tile.tileIndex === centerTileIndex)
    ?? snapshot.board.tiles[0]
    ?? {
      tileIndex: 0,
      name: "Unknown Tile",
      tileType: "neutral"
    };
  const currentProperty = Object.values(snapshot.board.properties).find(
    (property) => property.tileIndex === currentTile.tileIndex
  ) ?? null;
  const previewPlayers: MatchShellPlayerPreview[] = players.map((player) => ({
    playerId: player.playerId,
    displayName: player.displayName,
    balance: player.balance,
    position: player.position,
    ownedPropertyCount: Object.values(snapshot.board.properties).filter(
      (property) => property.ownerPlayerId === player.playerId
    ).length,
    status: player.connection.status === "disconnected_reserved"
      ? "reconnect_reserved"
      : player.isBankrupt || player.isAbandoned
        ? "waiting"
        : "active",
    isCurrentPlayer: player.playerId === currentPlayerId,
    isActiveTurn: player.playerId === snapshot.turn.activePlayerId
  }));

  return {
    matchId: snapshot.matchId,
    status: snapshot.status === "finished" ? "finished" : "playing",
    turnNumber: snapshot.turn.turnNumber,
    phaseLabel: snapshot.status === "finished"
      ? "Finished"
      : snapshot.turn.phase.replace(/_/g, " ").replace(/\b\w/g, (value) => value.toUpperCase()),
    activePlayerId: snapshot.turn.activePlayerId,
    currentTileName: currentTile.name,
    currentTileType: currentTile.tileType,
    players: previewPlayers,
    actions: createMatchActions(snapshot, currentPlayerId, currentTile.name),
    feed: feed.length > 0 ? feed : createDefaultFeed(snapshot, currentPlayerId),
    boardWindow: createBoardWindow(snapshot, centerTileIndex),
    connectionBanner: resolveMatchConnectionBanner(snapshot, currentPlayerId, roomStatus, errorMessage),
    economy: {
      localBalance: currentPlayer?.balance ?? 0,
      ownedPropertyCount: previewPlayers.find((player) => player.playerId === currentPlayerId)?.ownedPropertyCount ?? 0,
      nextBuyOpportunity: snapshot.turn.canBuyCurrentProperty && currentProperty
        ? currentProperty.name
        : "Awaiting next tile result",
      nextBuyCost: snapshot.turn.canBuyCurrentProperty && currentProperty
        ? currentProperty.purchasePrice
        : null
    }
  };
}

function createFeedEntry(kind: MatchFeedKind, title: string, detail: string): MatchFeedEntryPreview {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    kind,
    title,
    detail,
    timestampLabel: formatTimestampLabel()
  };
}

export function appendFeedEntry(
  entries: MatchFeedEntryPreview[],
  entry: MatchFeedEntryPreview | null
): MatchFeedEntryPreview[] {
  if (entry === null) {
    return entries;
  }

  return [entry, ...entries].slice(0, 12);
}

export function createMatchFeedEntryFromEvent(
  eventName: string,
  payload: unknown,
  snapshot: MonopolyRoomState | null
): MatchFeedEntryPreview | null {
  if (!snapshot) {
    return null;
  }

  switch (eventName) {
    case GAME_DICE_ROLLED_EVENT: {
      const event = payload as GameDiceRolledEvent;
      return createFeedEntry(
        "turn",
        `${getPlayerLabel(snapshot, event.playerId)} rolled ${event.diceValueA} + ${event.diceValueB}`,
        `The authoritative total is ${event.diceTotal}.`
      );
    }
    case GAME_PLAYER_MOVED_EVENT: {
      const event = payload as GamePlayerMovedEvent;
      const destination = snapshot.board.tiles.find((tile) => tile.tileIndex === event.toTileIndex)?.name ?? `Tile ${event.toTileIndex}`;
      return createFeedEntry(
        "turn",
        `${getPlayerLabel(snapshot, event.playerId)} moved to ${destination}`,
        event.passedStart ? "The move also crossed GO and triggered the salary rule." : "The move resolved without crossing GO."
      );
    }
    case GAME_TILE_RESOLVED_EVENT: {
      const event = payload as GameTileResolvedEvent;
      const kind: MatchFeedKind = event.summaryCode === "PAID_RENT" || event.summaryCode === "PAID_TAX"
        ? "payment"
        : event.summaryCode === "PROPERTY_AVAILABLE"
          ? "property"
          : "turn";
      return createFeedEntry(kind, `Tile resolved on ${event.tileType}`, event.message);
    }
    case GAME_PAYMENT_APPLIED_EVENT: {
      const event = payload as GamePaymentAppliedEvent;
      const source = getPlayerLabel(snapshot, event.fromPlayerId ?? null);
      const target = event.toPlayerId ? getPlayerLabel(snapshot, event.toPlayerId) : "the bank";
      return createFeedEntry(
        "payment",
        `${source} paid ${event.amount}`,
        `Funds moved to ${target} because of ${event.reason.replace(/_/g, " ").toLowerCase()}.`
      );
    }
    case GAME_PROPERTY_PURCHASED_EVENT: {
      const event = payload as GamePropertyPurchasedEvent;
      const property = snapshot.board.properties[event.propertyId]?.name ?? `Property ${event.propertyId}`;
      return createFeedEntry(
        "property",
        `${getPlayerLabel(snapshot, event.playerId)} bought ${property}`,
        `Purchase price ${event.purchasePrice} on tile ${event.tileIndex}.`
      );
    }
    case GAME_PLAYER_CONNECTION_CHANGED_EVENT: {
      const event = payload as GamePlayerConnectionChangedEvent;
      const reconnectNote = event.reconnectDeadlineAt
        ? `Reconnect held until ${formatTimestampLabel(event.reconnectDeadlineAt)}.`
        : "Connection state updated by the room lifecycle.";
      return createFeedEntry(
        "connection",
        `${getPlayerLabel(snapshot, event.playerId)} is now ${event.status.replace(/_/g, " ")}`,
        reconnectNote
      );
    }
    case GAME_PLAYER_ELIMINATED_EVENT: {
      const event = payload as GamePlayerEliminatedEvent;
      return createFeedEntry(
        "turn",
        `${getPlayerLabel(snapshot, event.playerId)} was eliminated`,
        `Elimination reason: ${event.reason.replace(/_/g, " ").toLowerCase()}.`
      );
    }
    case GAME_RESULT_READY_EVENT: {
      const event = payload as GameResultReadyEvent;
      return createFeedEntry(
        "turn",
        `${getPlayerLabel(snapshot, event.winnerPlayerId)} won the match`,
        `The live room marked the result as ${event.endReason.replace(/_/g, " ").toLowerCase()}.`
      );
    }
    case GAME_ERROR_EVENT:
      return createFeedEntry(
        "connection",
        "Room rejected a command",
        (payload as { message?: string }).message ?? "The live room sent an error response."
      );
    default:
      return null;
  }
}