import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

export default async function configRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/config/vapid', async (request, reply) => {
    try {
      let publicKeySetting = await prisma.systemSetting.findUnique({
        where: { key: 'VAPID_PUBLIC_KEY' }
      });
      let privateKeySetting = await prisma.systemSetting.findUnique({
        where: { key: 'VAPID_PRIVATE_KEY' }
      });

      if (!publicKeySetting || !privateKeySetting) {
        // Generate new keys
        const vapidKeys = webpush.generateVAPIDKeys();
        
        publicKeySetting = await prisma.systemSetting.upsert({
          where: { key: 'VAPID_PUBLIC_KEY' },
          update: { value: vapidKeys.publicKey },
          create: { key: 'VAPID_PUBLIC_KEY', value: vapidKeys.publicKey }
        });
        
        privateKeySetting = await prisma.systemSetting.upsert({
          where: { key: 'VAPID_PRIVATE_KEY' },
          update: { value: vapidKeys.privateKey },
          create: { key: 'VAPID_PRIVATE_KEY', value: vapidKeys.privateKey }
        });

        // Set them in the webpush library permanently for this instance process
        webpush.setVapidDetails(
          'mailto:support@iota.app',
          vapidKeys.publicKey,
          vapidKeys.privateKey
        );
      }

      return { publicKey: publicKeySetting.value };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
