import { Client } from "colyseus.js";

const DEFAULT_GAME_SERVER_URL = "ws://localhost:3002";

let colyseusClient: Client | null = null;

function normalizeGameServerUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getGameServerUrl(): string {
  const configuredValue = import.meta.env.VITE_GAME_SERVER_URL;

  if (typeof configuredValue === "string" && configuredValue.trim().length > 0) {
    return normalizeGameServerUrl(configuredValue.trim());
  }

  return DEFAULT_GAME_SERVER_URL;
}

export function getColyseusClient(): Client {
  if (colyseusClient === null) {
    colyseusClient = new Client(getGameServerUrl());
  }

  return colyseusClient;
}