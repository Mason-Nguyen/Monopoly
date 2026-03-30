import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { getGameServerPersistenceDatabaseConfig } from "./config.js";

const globalForGameServerPrisma = globalThis as typeof globalThis & {
  gameServerPrisma?: PrismaClient;
};

function createGameServerPrismaClient(): PrismaClient {
  const config = getGameServerPersistenceDatabaseConfig();

  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required to create the game-server Prisma client.");
  }

  const adapter = new PrismaPg({ connectionString: config.databaseUrl });
  return new PrismaClient({ adapter });
}

export function isGameServerPersistenceConfigured(): boolean {
  return getGameServerPersistenceDatabaseConfig().isConfigured;
}

export function getGameServerPrismaClient(): PrismaClient {
  if (!globalForGameServerPrisma.gameServerPrisma) {
    globalForGameServerPrisma.gameServerPrisma = createGameServerPrismaClient();
  }

  return globalForGameServerPrisma.gameServerPrisma;
}

export async function disconnectGameServerPrismaClient(): Promise<void> {
  if (!globalForGameServerPrisma.gameServerPrisma) {
    return;
  }

  await globalForGameServerPrisma.gameServerPrisma.$disconnect();
  globalForGameServerPrisma.gameServerPrisma = undefined;
}
