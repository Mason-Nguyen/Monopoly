import Fastify, { type FastifyInstance } from "fastify";
import { registerApiErrorHandling } from "./common/index.js";
import {
  registerHealthRoutes,
  registerLeaderboardRoutes,
  registerMatchRoutes,
  registerProfileRoutes
} from "./modules/index.js";

export function createApiApp(): FastifyInstance {
  const app = Fastify({
    logger: true
  });

  registerApiErrorHandling(app);
  app.register(registerHealthRoutes);
  app.register(registerProfileRoutes);
  app.register(registerLeaderboardRoutes);
  app.register(registerMatchRoutes);

  return app;
}