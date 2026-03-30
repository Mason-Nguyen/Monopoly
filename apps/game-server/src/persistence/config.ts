export interface GameServerPersistenceDatabaseConfig {
  databaseUrl?: string;
  isConfigured: boolean;
}

export function getGameServerPersistenceDatabaseConfig(): GameServerPersistenceDatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    databaseUrl,
    isConfigured: typeof databaseUrl === "string" && databaseUrl.length > 0
  };
}
