import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/pools/:id/games",
    { onRequest: authenticate },
    async (request, replay) => {
      const listGamesParams = z.object({
        id: z.string(),
      });

      const { id } = listGamesParams.parse(request.params);

      const pool = await prisma.pool.findUnique({
        where: { id },
      });

      if (!pool) {
        return replay.status(400).send({
          message: "Pool not found.",
        });
      }

      const games = await prisma.game.findMany({
        orderBy: {
          date: "desc",
        },
        include: {
          guesses: {
            where: {
              participant: {
                userId: request.user.sub,
                poolId: id,
              },
            },
          },
        },
      });

      const formattedGames = games.map((game) => {
        return {
          ...game,
          guess: game.guesses.length > 0 ? game.guesses[0] : null,
          guesses: undefined,
        };
      });

      return { games: formattedGames };
    }
  );
}
