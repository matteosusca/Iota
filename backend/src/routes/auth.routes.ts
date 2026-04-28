import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/auth/anonymous', async (request, reply) => {
    const { deviceId } = request.body as { deviceId?: string };

    if (!deviceId) {
      return reply.status(400).send({ error: 'deviceId is required' });
    }

    try {
      // Use upsert to atomically find or create the user, preventing race conditions
      const user = await prisma.user.upsert({
        where: { id: deviceId },
        update: {}, // No updates needed if user exists
        create: { id: deviceId }
      });

      const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '1y' });

      return {
        token,
        user: {
          id: user.id,
          createdAt: user.createdAt,
          streakCount: user.streakCount
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/api/v1/auth/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          createdAt: true,
          streakCount: true
        }
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return user;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
