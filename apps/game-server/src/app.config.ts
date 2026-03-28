import { defineRoom, defineServer } from "colyseus";
import { createGameServerMetadata } from "./services/index.js";
import { LobbyRoom, MonopolyRoom } from "./rooms/index.js";

export const gameServer = defineServer({
  rooms: {
    lobby: defineRoom(LobbyRoom),
    monopoly: defineRoom(MonopolyRoom)
  },
  express: (app) => {
    app.get("/", (_request: any, response: any) => {
      response.json(createGameServerMetadata());
    });

    app.get("/health", (_request: any, response: any) => {
      response.json({
        service: "monopoly-game-server",
        status: "ok",
        timestamp: new Date().toISOString()
      });
    });
  }
});