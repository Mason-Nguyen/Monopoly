import type { FastifyInstance } from "fastify";
import {
  assertFound,
  createPaginationMeta,
  createPaginationQuerySchema,
  createRequestMeta,
  createSuccessResponse,
  parseRequestParams,
  parseRequestQuery,
  z
} from "../../common/index.js";
import type { MatchPlayerSummary, MatchSummary } from "./match.types.js";
import { MatchesService } from "./matches.service.js";

const matchParamsSchema = z
  .object({
    matchId: z.string().uuid()
  })
  .strict();

const matchesQuerySchema = createPaginationQuerySchema({
  defaultLimit: 20,
  defaultOffset: 0,
  maxLimit: 100
});

function toMatchPlayerResponse(player: MatchPlayerSummary) {
  return {
    userId: player.userId,
    displayNameSnapshot: player.displayNameSnapshot,
    turnOrder: player.turnOrder,
    finalBalance: player.finalBalance,
    finalPosition: player.finalPosition,
    finalRank: player.finalRank,
    isBankrupt: player.isBankrupt,
    isAbandoned: player.isAbandoned,
    eliminationReason: player.eliminationReason
  };
}

function toMatchResponse(match: MatchSummary) {
  return {
    matchId: match.matchId,
    sourceLobbyId: match.sourceLobbyId,
    boardConfigKey: match.boardConfigKey,
    status: match.status,
    startedAt: match.startedAt.toISOString(),
    finishedAt: match.finishedAt?.toISOString() ?? null,
    endReason: match.endReason,
    winnerUserId: match.winnerUserId,
    playerCount: match.playerCount,
    players: match.players.map(toMatchPlayerResponse)
  };
}

export async function registerMatchRoutes(app: FastifyInstance): Promise<void> {
  const matchesService = new MatchesService();

  app.get("/matches", async (request) => {
    const query = parseRequestQuery(request, matchesQuerySchema, {
      message: "Match history query validation failed."
    });

    const result = await matchesService.listRecentMatches(query);

    return createSuccessResponse(
      {
        matches: result.items.map(toMatchResponse)
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

  app.get("/matches/:matchId", async (request) => {
    const params = parseRequestParams(request, matchParamsSchema);

    const match = assertFound(await matchesService.getMatchById(params.matchId), {
      resourceName: "Match",
      details: {
        matchId: params.matchId
      }
    });

    return createSuccessResponse(
      {
        match: toMatchResponse(match)
      },
      createRequestMeta(request)
    );
  });
}