import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
  /**
   * API: GET /api/user/me
   * Fetches the current user's profile and stats (coins, streak, freezes).
   */
  static async getMe(req: Request, res: Response) {
    try {
      // Using the seeded test user UUID for now as specified
      const userId = '927d8b9b-d72b-4227-9fa3-4dd38cc50540';

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          coins: true,
          currentStreak: true,
          streakFreezes: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
