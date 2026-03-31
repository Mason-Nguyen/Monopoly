export const queryKeys = {
  leaderboard: {
    list(limit: number, offset: number) {
      return ["leaderboard", "list", limit, offset] as const;
    },
    detail(userId: string) {
      return ["leaderboard", "detail", userId] as const;
    }
  },
  matches: {
    list(limit: number, offset: number) {
      return ["matches", "list", limit, offset] as const;
    },
    detail(matchId: string) {
      return ["matches", "detail", matchId] as const;
    }
  },
  matchShell: {
    preview(matchId: string, playerId: string, displayName: string) {
      return ["match-shell", "preview", matchId, playerId, displayName] as const;
    }
  },
  profiles: {
    detail(userId: string) {
      return ["profiles", "detail", userId] as const;
    },
    list(userIds: readonly string[]) {
      return ["profiles", "list", ...userIds] as const;
    }
  },
  lobbies: {
    list(playerId: string, displayName: string) {
      return ["lobbies", "list", playerId, displayName] as const;
    },
    detail(lobbyId: string, playerId: string, displayName: string) {
      return ["lobbies", "detail", lobbyId, playerId, displayName] as const;
    }
  }
};