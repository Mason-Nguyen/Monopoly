function parsePort(rawPort, fallbackPort) {
    const parsedPort = Number.parseInt(rawPort ?? "", 10);
    return Number.isFinite(parsedPort) ? parsedPort : fallbackPort;
}
export function getGameServerRuntimeConfig() {
    return {
        port: parsePort(process.env.GAME_SERVER_PORT ?? process.env.PORT, 2567),
        nodeEnv: process.env.NODE_ENV ?? "development"
    };
}
