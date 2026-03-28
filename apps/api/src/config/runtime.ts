export interface ApiRuntimeConfig {
  host: string;
  port: number;
  nodeEnv: string;
  databaseUrl?: string;
  isDatabaseConfigured: boolean;
}

function parsePort(rawPort: string | undefined, fallbackPort: number): number {
  const parsedPort = Number.parseInt(rawPort ?? "", 10);
  return Number.isFinite(parsedPort) ? parsedPort : fallbackPort;
}

export function getApiRuntimeConfig(): ApiRuntimeConfig {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    host: process.env.API_HOST ?? process.env.HOST ?? "0.0.0.0",
    port: parsePort(process.env.API_PORT ?? process.env.PORT, 4000),
    nodeEnv: process.env.NODE_ENV ?? "development",
    databaseUrl,
    isDatabaseConfigured: typeof databaseUrl === "string" && databaseUrl.length > 0
  };
}