import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
  fastify.post("/pools", async (request, replay) => {
    const createPollBody = z.object({
      title: z.string(),
    });

    const { title } = createPollBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    try {
      await request.jwtVerify();

      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,
          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch {
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      });
    }

    return replay.status(201).send({ code });
  });

  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();

    return { count };
  });

  fastify.post(
    "/pools/join",
    { onRequest: authenticate },
    async (request, replay) => {
      const joinPoolBody = z.object({
        code: z.string(),
      });

      const { code } = joinPoolBody.parse(request.body);
      const userId = request.user.sub;

      const pool = await prisma.pool.findUnique({
        where: {
          code,
        },
        include: {
          participants: {
            where: {
              userId,
            },
          },
        },
      });

      if (!pool) {
        return replay.status(400).send({
          message: "Pool not found",
        });
      }

      if (pool.participants.length > 0) {
        return replay.status(400).send({
          message: "You already joined this pool.",
        });
      }

      if (!pool.ownerId) {
        await prisma.pool.update({
          where: {
            id: pool.id,
          },
          data: {
            ownerId: userId,
          },
        });
      }

      await prisma.participant.create({
        data: {
          poolId: pool.id,
          userId,
        },
      });

      return replay.status(201).send();
    }
  );

  fastify.get("/pools", { onRequest: authenticate }, async (request) => {
    const pools = await prisma.pool.findMany({
      where: {
        participants: {
          some: {
            userId: request.user.sub,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              },
            },
          },
          take: 4,
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return { pools };
  });

  fastify.get(
    "/pools/:id",
    { onRequest: authenticate },
    async (request, replay) => {
      const getPoolParams = z.object({
        id: z.string(),
      });

      const { id } = getPoolParams.parse(request.params);

      const pool = await prisma.pool.findUnique({
        where: {
          id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            select: {
              id: true,
              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });

      if (!pool) {
        return replay.status(400).send({
          message: "Pool not found.",
        });
      }

      return { pool };
    }
  );
}
