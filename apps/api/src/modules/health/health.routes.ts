import type { FastifyInstance } from "fastify";
import { createRequestMeta, createSuccessResponse } from "../../common/index.js";
import { getApiRuntimeConfig } from "../../config/index.js";
import { isPrismaConfigured } from "../../prisma/index.js";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (request) => {
    const config = getApiRuntimeConfig();

    return createSuccessResponse(
      {
        service: "monopoly-api",
        status: "ready",
        phase: "phase-5-step-6",
        message: "API validation and error-handling integration baseline is active.",
        databaseConfigured: config.isDatabaseConfigured
      },
      createRequestMeta(request)
    );
  });

  app.get("/health", async (request) =>
    createSuccessResponse(
      {
        service: "monopoly-api",
        status: "ok",
        prismaConfigured: isPrismaConfigured(),
        timestamp: new Date().toISOString()
      },
      createRequestMeta(request)
    )
  );
}