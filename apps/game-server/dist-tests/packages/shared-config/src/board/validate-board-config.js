function countTilesByType(tiles, tileType) {
    return tiles.filter((tile) => tile.tileType === tileType).length;
}
export function validateBoardConfig(boardConfig) {
    const errors = [];
    const tileIndices = new Set();
    const propertyIds = new Set();
    const propertyById = new Map(boardConfig.properties.map((property) => [property.propertyId, property]));
    const tileByIndex = new Map(boardConfig.tiles.map((tile) => [tile.tileIndex, tile]));
    if (boardConfig.tileCount !== 40) {
        errors.push("Board config must declare exactly 40 tiles for the classic MVP board.");
    }
    if (boardConfig.tiles.length !== boardConfig.tileCount) {
        errors.push("Board config tileCount must match the number of tile entries.");
    }
    for (let tileIndex = 0; tileIndex < boardConfig.tileCount; tileIndex += 1) {
        if (!tileByIndex.has(tileIndex)) {
            errors.push(`Missing tile definition for tile index ${tileIndex}.`);
        }
    }
    for (const tile of boardConfig.tiles) {
        if (tileIndices.has(tile.tileIndex)) {
            errors.push(`Duplicate tile index detected: ${tile.tileIndex}.`);
        }
        tileIndices.add(tile.tileIndex);
        if (tile.tileType === "property" && !tile.propertyId) {
            errors.push(`Property tile at index ${tile.tileIndex} is missing propertyId.`);
        }
        if (tile.tileType !== "property" && tile.propertyId) {
            errors.push(`Non-property tile at index ${tile.tileIndex} should not include propertyId.`);
        }
        if (typeof tile.targetTileIndex === "number") {
            if (tile.targetTileIndex < 0 || tile.targetTileIndex >= boardConfig.tileCount) {
                errors.push(`Tile at index ${tile.tileIndex} has invalid targetTileIndex ${tile.targetTileIndex}.`);
            }
        }
    }
    for (const property of boardConfig.properties) {
        if (propertyIds.has(property.propertyId)) {
            errors.push(`Duplicate propertyId detected: ${property.propertyId}.`);
        }
        propertyIds.add(property.propertyId);
        const linkedTile = tileByIndex.get(property.tileIndex);
        if (!linkedTile) {
            errors.push(`Property ${property.propertyId} points to missing tile index ${property.tileIndex}.`);
            continue;
        }
        if (linkedTile.tileType !== "property") {
            errors.push(`Property ${property.propertyId} points to tile ${property.tileIndex}, which is not a property tile.`);
        }
        if (linkedTile.propertyId !== property.propertyId) {
            errors.push(`Property ${property.propertyId} does not match the propertyId on tile ${property.tileIndex}.`);
        }
    }
    for (const tile of boardConfig.tiles) {
        if (tile.propertyId && !propertyById.has(tile.propertyId)) {
            errors.push(`Tile at index ${tile.tileIndex} references unknown propertyId ${tile.propertyId}.`);
        }
    }
    if (countTilesByType(boardConfig.tiles, "start") !== 1) {
        errors.push("Board config must contain exactly one start tile.");
    }
    if (countTilesByType(boardConfig.tiles, "jail") !== 1) {
        errors.push("Board config must contain exactly one jail tile.");
    }
    if (countTilesByType(boardConfig.tiles, "go_to_jail") !== 1) {
        errors.push("Board config must contain exactly one go_to_jail tile.");
    }
    if (countTilesByType(boardConfig.tiles, "free_parking") !== 1) {
        errors.push("Board config must contain exactly one free_parking tile.");
    }
    return errors;
}
export function assertValidBoardConfig(boardConfig) {
    const errors = validateBoardConfig(boardConfig);
    if (errors.length > 0) {
        throw new Error(`Invalid board config: ${errors.join(" ")}`);
    }
    return boardConfig;
}
