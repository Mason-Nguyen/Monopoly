import "dotenv/config";
import { createApiApp } from "./app.js";
import { getApiRuntimeConfig } from "./config/index.js";

export async function startApiServer(): Promise<void> {
  const app = createApiApp();
  const config = getApiRuntimeConfig();

  try {
    await app.listen({
      host: config.host,
      port: config.port
    });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
    throw error;
  }
}

void startApiServer();