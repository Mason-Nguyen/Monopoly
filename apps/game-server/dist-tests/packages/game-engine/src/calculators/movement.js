export function calculateMovement(boardConfig, fromTileIndex, spaces) {
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
