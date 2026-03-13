import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StoreController {
  /**
   * API: POST /api/store/buy-freeze
   * Deducts 10 coins and gives 1 streak freeze.
   */
  static async buyFreeze(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // 1. Fetch user to check coin balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const cost = 10;
      if (user.coins < cost) {
        return res.status(400).json({ error: 'Not enough coins' });
      }

      // 2. Perform transaction to safely deduct coins and add freeze
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: cost },
          streakFreezes: { increment: 1 }
        },
        select: {
          coins: true,
          streakFreezes: true
        }
      });

      return res.status(200).json({ 
        message: 'Successfully purchased 1 Streak Freeze', 
        user: updatedUser 
      });

    } catch (error: any) {
      console.error('Error buying freeze:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
