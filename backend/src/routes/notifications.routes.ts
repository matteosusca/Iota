import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function notificationsRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/notifications/subscribe', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { subscription } = request.body as { subscription: any };

    if (!subscription) {
      return reply.status(400).send({ error: 'subscription object is required' });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          pushSubscription: subscription
        }
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
