export function getGameServerPersistenceDatabaseConfig() {
    const databaseUrl = process.env.DATABASE_URL;
    return {
        databaseUrl,
        isConfigured: typeof databaseUrl === "string" && databaseUrl.length > 0
    };
}
