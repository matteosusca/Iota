import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { calculateUserStreak } from '../services/streak.service';

const prisma = new PrismaClient();

export default async function logsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/logs', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

    try {
      const whereClause: any = { userId };
      
      if (startDate || endDate) {
        whereClause.logicalDate = {};
        if (startDate) whereClause.logicalDate.gte = new Date(startDate);
        if (endDate) whereClause.logicalDate.lte = new Date(endDate);
      }

      const logs = await prisma.dailyLog.findMany({
        where: whereClause,
        orderBy: { logicalDate: 'asc' }
      });

      const formattedLogs = logs.map(log => ({
        id: log.id,
        userId: log.userId,
        logicalDate: log.logicalDate.toISOString().split('T')[0],
        status: log.status,
        completionPercentage: log.completionPercentage,
        lastUpdated: log.lastUpdated.toISOString(),
        exercisesSnapshot: log.exercisesSnapshot
      }));

      return { logs: formattedLogs };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.put('/api/v1/logs/:logicalDate', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const { logicalDate } = request.params as { logicalDate: string };
    const incomingLog = request.body as any;

    try {
      const id = `${userId}_${logicalDate}`;
      const incomingLastUpdated = new Date(incomingLog.lastUpdated);

      const existingLog = await prisma.dailyLog.findUnique({
        where: { id }
      });

      // LWW: If existing log has a strictly newer timestamp, reject the overwrite
      if (existingLog && existingLog.lastUpdated.getTime() > incomingLastUpdated.getTime()) {
        return reply.send({ success: true, message: 'Existing log is newer, skipping update.' });
      }

      // Perform upsert
      await prisma.dailyLog.upsert({
        where: { id },
        update: {
          status: incomingLog.status,
          completionPercentage: incomingLog.completionPercentage,
          exercisesSnapshot: incomingLog.exercisesSnapshot,
          lastUpdated: incomingLastUpdated
        },
        create: {
          id,
          userId,
          logicalDate: new Date(logicalDate), // Converts "YYYY-MM-DD" reliably enough
          status: incomingLog.status,
          completionPercentage: incomingLog.completionPercentage,
          exercisesSnapshot: incomingLog.exercisesSnapshot,
          lastUpdated: incomingLastUpdated
        }
      });

      // Recalculate and update user's cached streak
      const streakCount = await calculateUserStreak(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { streakCount }
      });

      return { success: true, streakCount };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
