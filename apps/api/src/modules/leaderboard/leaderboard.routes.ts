import type { FastifyInstance } from "fastify";
import {
  assertFound,
  createPaginationMeta,
  createRequestMeta,
  createPaginationQuerySchema,
  createSuccessResponse,
  parseRequestParams,
  parseRequestQuery,
  z
} from "../../common/index.js";
import type { LeaderboardEntry } from "./leaderboard.types.js";
import { LeaderboardService } from "./leaderboard.service.js";

const leaderboardParamsSchema = z
  .object({
    userId: z.string().uuid()
  })
  .strict();

const leaderboardQuerySchema = createPaginationQuerySchema({
  defaultLimit: 20,
  defaultOffset: 0,
  maxLimit: 100
});

function toLeaderboardEntryResponse(entry: LeaderboardEntry) {
  return {
    userId: entry.userId,
    displayName: entry.displayName,
    avatarKey: entry.avatarKey,
    matchesPlayed: entry.matchesPlayed,
    wins: entry.wins,
    losses: entry.losses,
    bankruptcies: entry.bankruptcies,
    abandons: entry.abandons,
    lastMatchAt: entry.lastMatchAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function registerLeaderboardRoutes(
  app: FastifyInstance
): Promise<void> {
  const leaderboardService = new LeaderboardService();

  app.get("/leaderboard", async (request) => {
    const query = parseRequestQuery(request, leaderboardQuerySchema, {
      message: "Leaderboard query validation failed."
    });

    const result = await leaderboardService.listTopLeaderboardEntries(query);

    return createSuccessResponse(
      {
        entries: result.items.map((entry, index) => ({
          rank: result.offset + index + 1,
          ...toLeaderboardEntryResponse(entry)
        }))
      },
      createPaginationMeta(
        request,
        {
          limit: result.limit,
          offset: result.offset
        },
        {
          returnedCount: result.items.length
        }
      )
    );
  });

  app.get("/leaderboard/:userId", async (request) => {
    const params = parseRequestParams(request, leaderboardParamsSchema);

    const entry = assertFound(
      await leaderboardService.getLeaderboardEntryByUserId(params.userId),
      {
        resourceName: "Leaderboard entry",
        details: {
          userId: params.userId
        }
      }
    );

    return createSuccessResponse(
      {
        entry: toLeaderboardEntryResponse(entry)
      },
      createRequestMeta(request)
    );
  });
}