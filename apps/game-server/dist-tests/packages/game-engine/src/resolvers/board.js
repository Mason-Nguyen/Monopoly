import { EngineRuleError } from "../rules/errors.js";
export function getTileConfigOrThrow(boardConfig, tileIndex) {
    const tileConfig = boardConfig.tiles.find((tile) => tile.tileIndex === tileIndex);
    if (!tileConfig) {
        throw new EngineRuleError(`Board config does not contain tile index ${tileIndex}.`);
    }
    return tileConfig;
}
export function getPropertyConfigOrThrow(boardConfig, propertyId) {
    const propertyConfig = boardConfig.properties.find((property) => property.propertyId === propertyId);
    if (!propertyConfig) {
        throw new EngineRuleError(`Board config does not contain property ${propertyId}.`);
    }
    return propertyConfig;
}
