import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export class JailStateSchema extends Schema {
  @type("boolean") isInJail = false;
  @type("number") turnsRemaining = 0;
}

export class ConnectionStateSchema extends Schema {
  @type("string") status = "connected";
  @type("number") reconnectDeadlineAt = 0;
}

export class MatchPlayerStateSchema extends Schema {
  @type("string") playerId = "";
  @type("string") displayName = "";
  @type("number") turnOrder = 0;
  @type("number") position = 0;
  @type("number") balance = 0;
  @type("boolean") isBankrupt = false;
  @type("boolean") isAbandoned = false;
  @type(JailStateSchema) jail = new JailStateSchema();
  @type(ConnectionStateSchema) connection = new ConnectionStateSchema();
}

export class TileStateSchema extends Schema {
  @type("number") tileIndex = 0;
  @type("string") key = "";
  @type("string") name = "";
  @type("string") tileType = "neutral";
  @type("string") propertyId = "";
  @type("number") taxAmount = 0;
  @type("number") targetTileIndex = -1;
}

export class PropertyStateSchema extends Schema {
  @type("string") propertyId = "";
  @type("number") tileIndex = 0;
  @type("string") key = "";
  @type("string") name = "";
  @type("number") purchasePrice = 0;
  @type("number") rentAmount = 0;
  @type("string") colorGroup = "";
  @type("string") ownerPlayerId = "";
}

export class BoardStateSchema extends Schema {
  @type("string") boardId = "";
  @type("number") tileCount = 0;
  @type({ array: TileStateSchema }) tiles = new ArraySchema<TileStateSchema>();
  @type({ map: PropertyStateSchema }) properties = new MapSchema<PropertyStateSchema>();
}

export class TurnStateSchema extends Schema {
  @type("number") turnNumber = 1;
  @type("string") activePlayerId = "";
  @type("string") phase = "await_roll";
  @type("number") diceTotal = 0;
  @type("number") diceValueA = 0;
  @type("number") diceValueB = 0;
  @type("number") currentTileIndex = -1;
  @type("boolean") canBuyCurrentProperty = false;
  @type("boolean") awaitingInput = true;
}

export class MatchResultStateSchema extends Schema {
  @type("string") winnerPlayerId = "";
  @type("string") endReason = "";
  @type("number") finishedAt = 0;
}

export class MonopolyRoomStateSchema extends Schema {
  @type("string") matchId = "";
  @type("string") sourceLobbyId = "";
  @type("string") status = "playing";
  @type("number") startedAt = 0;
  @type("number") finishedAt = 0;
  @type({ map: MatchPlayerStateSchema }) players = new MapSchema<MatchPlayerStateSchema>();
  @type(BoardStateSchema) board = new BoardStateSchema();
  @type(TurnStateSchema) turn = new TurnStateSchema();
  @type(MatchResultStateSchema) result = new MatchResultStateSchema();
}