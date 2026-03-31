import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createGuestDisplayName,
  createGuestPlayerId,
  createGuestSessionSnapshot,
  normalizeDisplayName
} from "../services/session-service";

const SESSION_STORAGE_KEY = "monopoly.web.session.v1";

interface SessionStoreState {
  playerId: string | null;
  displayName: string;
  lastLobbyId: string | null;
  lastMatchId: string | null;
  reconnectToken: string | null;
  lastMatchRoomId: string | null;
  lastMatchReconnectToken: string | null;
  ensureGuestSession(): void;
  setDisplayName(value: string): void;
  setLastLobbyId(value: string | null): void;
  setLastMatchId(value: string | null): void;
  setReconnectToken(value: string | null): void;
  setLastMatchRoomId(value: string | null): void;
  setLastMatchReconnectToken(value: string | null): void;
  clearSession(): void;
}

function createInitialSessionState() {
  return createGuestSessionSnapshot();
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      ...createInitialSessionState(),
      ensureGuestSession() {
        const state = get();

        if (state.playerId && state.displayName.trim().length > 0) {
          return;
        }

        set((current) => ({
          playerId: current.playerId ?? createGuestPlayerId(),
          displayName:
            current.displayName.trim().length > 0
              ? current.displayName
              : createGuestDisplayName()
        }));
      },
      setDisplayName(value) {
        const normalized = normalizeDisplayName(value);

        set((state) => ({
          displayName:
            normalized.length > 0 ? normalized : state.displayName || createGuestDisplayName()
        }));
      },
      setLastLobbyId(value) {
        set({
          lastLobbyId: value
        });
      },
      setLastMatchId(value) {
        set({
          lastMatchId: value
        });
      },
      setReconnectToken(value) {
        set({
          reconnectToken: value
        });
      },
      setLastMatchRoomId(value) {
        set({
          lastMatchRoomId: value
        });
      },
      setLastMatchReconnectToken(value) {
        set({
          lastMatchReconnectToken: value
        });
      },
      clearSession() {
        set(createInitialSessionState());
      }
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        playerId: state.playerId,
        displayName: state.displayName,
        lastLobbyId: state.lastLobbyId,
        lastMatchId: state.lastMatchId,
        reconnectToken: state.reconnectToken,
        lastMatchRoomId: state.lastMatchRoomId,
        lastMatchReconnectToken: state.lastMatchReconnectToken
      })
    }
  )
);