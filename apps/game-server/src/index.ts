import "dotenv/config";
import { gameServer } from "./app.config.js";
import { getGameServerRuntimeConfig } from "./config/index.js";

export function startGameServer(): void {
  const config = getGameServerRuntimeConfig();

  gameServer.listen(config.port);
  console.log(`[GameServer] Listening on port ${config.port}`);
}

startGameServer();
