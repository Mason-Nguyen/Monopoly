import { CLASSIC_BOARD_CONFIG } from "@monopoly/shared-config";
import type { MatchShellPreview } from "../../services/match-shell-preview-queries";

export interface MatchBoardSceneTile {
  tileIndex: number;
  name: string;
  tileType: string;
  isCorner: boolean;
}

export interface MatchBoardSceneToken {
  playerId: string;
  displayName: string;
  balance: number;
  position: number;
  ownedPropertyCount: number;
  color: string;
  isActiveTurn: boolean;
  isCurrentPlayer: boolean;
  status: MatchShellPreview["players"][number]["status"];
}

export interface MatchBoardSceneViewModel {
  boardName: string;
  activeTileIndex: number;
  tiles: MatchBoardSceneTile[];
  tokens: MatchBoardSceneToken[];
}

const TOKEN_PALETTE = [
  "#d85f5f",
  "#4f7ed9",
  "#4ea66c",
  "#c8a24b",
  "#8c61d8",
  "#d97c44"
] as const;

function isCornerTile(tileIndex: number): boolean {
  return tileIndex % 10 === 0;
}

export function projectMatchBoardScene(preview: MatchShellPreview): MatchBoardSceneViewModel {
  const activePlayer = preview.players.find((player) => player.isActiveTurn) ?? preview.players[0] ?? null;

  return {
    boardName: CLASSIC_BOARD_CONFIG.name,
    activeTileIndex: activePlayer?.position ?? 0,
    tiles: CLASSIC_BOARD_CONFIG.tiles.map((tile) => ({
      tileIndex: tile.tileIndex,
      name: tile.name,
      tileType: tile.tileType,
      isCorner: isCornerTile(tile.tileIndex)
    })),
    tokens: preview.players.map((player, index) => ({
      playerId: player.playerId,
      displayName: player.displayName,
      balance: player.balance,
      ownedPropertyCount: player.ownedPropertyCount,
      position: player.position,
      color: TOKEN_PALETTE[index % TOKEN_PALETTE.length] ?? TOKEN_PALETTE[0],
      isActiveTurn: player.isActiveTurn,
      isCurrentPlayer: player.isCurrentPlayer,
      status: player.status
    }))
  };
}