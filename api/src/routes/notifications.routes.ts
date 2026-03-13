import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const subscription = req.body;
    const userId = (req as any).userId;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        pushSubscription: subscription,
      },
    });

    res.status(201).json({ message: 'Subscription saved successfully.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
