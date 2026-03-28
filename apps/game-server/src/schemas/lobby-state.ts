import { MapSchema, Schema, type } from "@colyseus/schema";

export class LobbyPlayerStateSchema extends Schema {
  @type("string") playerId = "";
  @type("string") displayName = "";
  @type("boolean") isHost = false;
  @type("boolean") isReady = false;
  @type("number") joinedAt = 0;
}

export class LobbyRoomStateSchema extends Schema {
  @type("string") lobbyId = "";
  @type("string") status = "waiting";
  @type("string") hostPlayerId = "";
  @type("number") minPlayers = 4;
  @type("number") maxPlayers = 6;
  @type("number") playerCount = 0;
  @type({ map: LobbyPlayerStateSchema }) players = new MapSchema<LobbyPlayerStateSchema>();
  @type("boolean") canStartMatch = false;
  @type("number") createdAt = 0;
}