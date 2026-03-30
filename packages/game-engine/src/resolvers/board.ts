import type {
  BoardConfig,
  PropertyConfig,
  PropertyId,
  TileConfig,
  TileIndex
} from "@monopoly/shared-types";
import { EngineRuleError } from "../rules/errors.js";

export function getTileConfigOrThrow(
  boardConfig: BoardConfig,
  tileIndex: TileIndex
): TileConfig {
  const tileConfig = boardConfig.tiles.find((tile) => tile.tileIndex === tileIndex);

  if (!tileConfig) {
    throw new EngineRuleError(`Board config does not contain tile index ${tileIndex}.`);
  }

  return tileConfig;
}

export function getPropertyConfigOrThrow(
  boardConfig: BoardConfig,
  propertyId: PropertyId
): PropertyConfig {
  const propertyConfig = boardConfig.properties.find(
    (property) => property.propertyId === propertyId
  );

  if (!propertyConfig) {
    throw new EngineRuleError(`Board config does not contain property ${propertyId}.`);
  }

  return propertyConfig;
}
