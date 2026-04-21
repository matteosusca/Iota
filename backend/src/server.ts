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

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on http://localhost:${port}`);
    
    // Initialize Cron Jobs after server is up and database migrations are likely done
    // Wrapping in a small timeout to ensure migrations are fully settled
    setTimeout(async () => {
      try {
        await notificationCron.init();
      } catch (err) {
        console.error('Failed to initialize cron jobs:', err);
      }
    }, 5000);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
