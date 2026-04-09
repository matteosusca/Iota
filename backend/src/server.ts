import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const fastify = Fastify({
  logger: true
});

const prisma = new PrismaClient();

fastify.register(cors, {
  origin: '*' // Configure properly in production
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
