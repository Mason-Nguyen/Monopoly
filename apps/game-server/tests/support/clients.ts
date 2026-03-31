import type { MatchJoinOptions } from "@monopoly/shared-types";
import type { JoinRequestSeed, SentMessageRecord, TestClientLike } from "./contracts.js";

let nextSessionCounter = 1;

export interface TestClientOptions {
  sessionId?: string;
  playerId?: string;
}

function createSessionId(): string {
  const sessionId = `test-session-${nextSessionCounter}`;
  nextSessionCounter += 1;
  return sessionId;
}

export function createTestClient(options: TestClientOptions = {}): TestClientLike {
  const sessionId = options.sessionId ?? createSessionId();
  const sentMessages: SentMessageRecord[] = [];

  return {
    sessionId,
    userData: options.playerId ? { playerId: options.playerId } : {},
    sentMessages,
    send(eventName: string, payload: unknown) {
      sentMessages.push({ eventName, payload });
    }
  };
}

export function createSeededMatchJoinOptions(seed: JoinRequestSeed): MatchJoinOptions {
  const options: MatchJoinOptions = {
    playerId: seed.playerId,
    matchId: seed.matchId ?? ""
  };

  if (seed.reconnectToken) {
    options.reconnectToken = seed.reconnectToken;
  }

  return options;
}

export function getSentMessages<TPayload = unknown>(
  client: TestClientLike,
  eventName: string
): TPayload[] {
  return client.sentMessages
    .filter((message) => message.eventName === eventName)
    .map((message) => message.payload as TPayload);
}

export function resetTestClientCounter(): void {
  nextSessionCounter = 1;
}
