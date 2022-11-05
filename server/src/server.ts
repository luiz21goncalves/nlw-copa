import cors from "@fastify/cors";
import env from "@fastify/env";
import jwt from "@fastify/jwt";
import Fastify from "fastify";

import { authRoutes } from "./routes/auth";
import { gameRoutes } from "./routes/game";
import { guessRoutes } from "./routes/guess";
import { poolRoutes } from "./routes/pool";
import { userRoutes } from "./routes/user";

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(env, {
    dotenv: true,
    data: process.env,
    schema: {
      type: "object",
      required: ["PORT", "JWT_SECRET", "JWT_EXPIRIES_IN"],
      properties: {
        PORT: {
          type: "number",
          default: 3333,
        },
        JWT_SECRET: {
          type: "string",
          default: "secret",
        },
        JWT_EXPIRIES_IN: {
          type: "string",
          default: "1d",
        },
      },
    },
  });

  await fastify.register(jwt, {
    secret: fastify.config.JWT_SECRET,
  });

  await fastify.register(authRoutes);
  await fastify.register(gameRoutes);
  await fastify.register(guessRoutes);
  await fastify.register(poolRoutes);
  await fastify.register(userRoutes);

  await fastify.listen({ port: fastify.config.PORT, host: "0.0.0.0" });
}

bootstrap();
