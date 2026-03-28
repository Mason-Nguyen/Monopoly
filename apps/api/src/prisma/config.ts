export interface PrismaDatabaseConfig {
  databaseUrl?: string;
  isConfigured: boolean;
}

export function getPrismaDatabaseConfig(): PrismaDatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    databaseUrl,
    isConfigured: typeof databaseUrl === "string" && databaseUrl.length > 0
  };
}