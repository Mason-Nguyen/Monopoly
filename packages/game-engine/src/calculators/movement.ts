import type { BoardConfig, TileIndex } from "@monopoly/shared-types";

export interface MovementResult {
  fromTileIndex: TileIndex;
  toTileIndex: TileIndex;
  passedStart: boolean;
}

export function calculateMovement(
  boardConfig: BoardConfig,
  fromTileIndex: TileIndex,
  spaces: number
): MovementResult {
  if (!Number.isInteger(spaces) || spaces < 0) {
    throw new Error("Movement spaces must be a non-negative integer.");
  }

  if (boardConfig.tileCount <= 0) {
    throw new Error("Board tile count must be greater than 0.");
  }

  const rawPosition = fromTileIndex + spaces;
  const toTileIndex = rawPosition % boardConfig.tileCount;

  return {
    fromTileIndex,
    toTileIndex,
    passedStart: rawPosition >= boardConfig.tileCount
  };
}