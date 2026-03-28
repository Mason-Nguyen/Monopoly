import type { FastifyInstance } from "fastify";
import {
  assertFound,
  createRequestMeta,
  createSuccessResponse,
  parseRequestParams,
  parseRequestQuery,
  z
} from "../../common/index.js";
import type { ProfileSummary } from "./profile.types.js";
import { ProfilesService } from "./profiles.service.js";

const profileParamsSchema = z
  .object({
    userId: z.string().uuid()
  })
  .strict();

const profilesQuerySchema = z
  .object({
    userIds: z
      .string()
      .trim()
      .min(1)
      .transform((value) =>
        Array.from(
          new Set(
            value
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          )
        )
      )
      .pipe(z.array(z.string().uuid()).min(1).max(20))
  })
  .strict();

function toProfileResponse(profile: ProfileSummary) {
  return {
    userId: profile.userId,
    authType: profile.authType,
    email: profile.email,
    displayName: profile.displayName,
    avatarKey: profile.avatarKey,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    lastSeenAt: profile.lastSeenAt?.toISOString() ?? null
  };
}

export async function registerProfileRoutes(app: FastifyInstance): Promise<void> {
  const profilesService = new ProfilesService();

  app.get("/profiles/:userId", async (request) => {
    const params = parseRequestParams(request, profileParamsSchema);

    const profile = assertFound(
      await profilesService.getProfileByUserId(params.userId),
      {
        resourceName: "Profile",
        details: {
          userId: params.userId
        }
      }
    );

    return createSuccessResponse(
      {
        profile: toProfileResponse(profile)
      },
      createRequestMeta(request)
    );
  });

  app.get("/profiles", async (request) => {
    const query = parseRequestQuery(request, profilesQuerySchema, {
      message: "Profile query validation failed."
    });

    const profiles = await profilesService.listProfilesByUserIds(query.userIds);

    return createSuccessResponse(
      {
        profiles: profiles.map(toProfileResponse)
      },
      createRequestMeta(request, {
        requestedCount: query.userIds.length,
        returnedCount: profiles.length
      })
    );
  });
}