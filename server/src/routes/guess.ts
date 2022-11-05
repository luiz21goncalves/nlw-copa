import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  fastify.post(
    "/pools/:poolId/games/:gameId/guesses",
    { onRequest: authenticate },
    async (request, replay) => {
      const createGuessParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { gameId, poolId } = createGuessParams.parse(request.params);
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        request.body
      );
      const userId = request.user.sub;

      const pool = await prisma.pool.findUnique({
        where: {
          id: poolId,
        },
      });

      if (!pool) {
        return replay.status(400).send({
          message: "Poll not found.",
        });
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        return replay.status(400).send({
          message: "Game not found.",
        });
      }

      if (game.date < new Date()) {
        return replay.status(400).send({
          message: "You cannot send guesses after the game date.",
        });
      }

      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            userId,
            poolId,
          },
        },
      });

      if (!participant) {
        return replay.status(400).send({
          message: "You're not allowed to create a guess inside this pool.",
        });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          participantId_gameId: {
            participantId: participant.id,
            gameId,
          },
        },
      });

      if (guess) {
        return replay.status(400).send({
          message: "You already sent a guesses to this game on this poll.",
        });
      }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });

      return replay.status(201).send();
    }
  );
}
