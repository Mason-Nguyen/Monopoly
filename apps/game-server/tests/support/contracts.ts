export interface SentMessageRecord<EventName extends string = string, Payload = unknown> {
  eventName: EventName;
  payload: Payload;
}

export interface TestClientLike {
  sessionId: string;
  userData?: Record<string, unknown>;
  send(eventName: string, payload: unknown): void;
  sentMessages: SentMessageRecord[];
}

export interface BroadcastRecord<EventName extends string = string, Payload = unknown> {
  eventName: EventName;
  payload: Payload;
  options?: {
    afterNextPatch?: boolean;
  };
}

export interface BroadcastCapableRoom {
  broadcast(eventName: string, payload: unknown, options?: { afterNextPatch?: boolean }): void;
}

export interface RoomBroadcastRecorder {
  broadcasts: BroadcastRecord[];
  clear(): void;
  restore(): void;
}

export interface JoinRequestSeed {
  playerId: string;
  matchId?: string;
  reconnectToken?: string;
}

export interface TestTimeoutHandle {
  clear(): void;
}
