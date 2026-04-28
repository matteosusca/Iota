import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authPlugin from './plugins/auth';
import authRoutes from './routes/auth.routes';
import routineRoutes from './routes/routine.routes';
import logsRoutes from './routes/logs.routes';
import configRoutes from './routes/config.routes';
import notificationsRoutes from './routes/notifications.routes';
import { notificationCron } from './services/notifications.cron';

dotenv.config();

const fastify = Fastify({
  logger: true
});

const prisma = new PrismaClient();

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Register Plugins
fastify.register(authPlugin);

// Register Routes
fastify.register(authRoutes);
fastify.register(routineRoutes);
fastify.register(logsRoutes);
fastify.register(configRoutes);
fastify.register(notificationsRoutes);

// Initialize Cron Jobs
notificationCron.init().catch(err => {
  fastify.log.error('Failed to initialize notification cron:', err);
});

fastify.get('/health', async (request, reply) => {
  try {
    // Just verifying database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ status: 'error', database: 'disconnected' });
  }
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
