import fp from 'fastify-plugin';
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string }; // User payload is the User ID
    user: { id: string }; 
  }
}

const authPlugin: FastifyPluginAsync = async (fastify, opts) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Missing or invalid token' });
    }
  });
};

export default fp(authPlugin);
