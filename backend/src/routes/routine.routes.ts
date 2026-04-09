import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function routineRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/routine', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;

    try {
      const routine = await prisma.routine.findFirst({
        where: { userId }
      });

      if (!routine) {
        return reply.status(404).send({ error: 'Routine not found' });
      }

      return {
        id: routine.id,
        userId: routine.userId,
        updatedAt: routine.updatedAt.toISOString(),
        exercises: routine.exercises
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.put('/api/v1/routine', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    // Routine payload from client
    const { id, exercises, updatedAt } = request.body as any;

    try {
      // Find existing
      const existingRoutine = await prisma.routine.findFirst({
        where: { userId }
      });

      // Simple LWW / Upsert logic for Routine
      if (existingRoutine) {
        // If the client provided an updatedAt, check if we need to decline update due to LWW?
        // Actually, routine doesn't strictly define LWW in DATA_MODELS, but it's good practice.
        if (updatedAt && existingRoutine.updatedAt.getTime() > new Date(updatedAt).getTime()) {
           // Client is older, ignore rewrite
           return reply.send({ success: true, message: 'Existing routine is newer' });
        }

        await prisma.routine.update({
          where: { id: existingRoutine.id },
          data: { exercises, updatedAt: updatedAt ? new Date(updatedAt) : new Date() }
        });
      } else {
        await prisma.routine.create({
          data: {
            id: id || `routine_${userId}`,
            userId,
            exercises,
            updatedAt: updatedAt ? new Date(updatedAt) : new Date()
          }
        });
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
