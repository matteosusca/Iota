import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StreakService {
  /**
   * Evaluates the completion of a user's routine for "Yesterday".
   * Updates their coins and streak accordingly.
   */
  static async evaluateYesterday(userId: string) {
    try {
      console.log(`Evaluating yesterday's routine for user: ${userId}`);

      // 1. Calculate Date Bounds for "Yesterday" (00:00:00 to 23:59:59)
      // Note: A more advanced version would use the user's timezone or a 03:00 AM cutoff offset.
      // For simplicity in this implementation, we assume UTC boundaries.
      const now = new Date();
      const yesterdayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0));
      const yesterdayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59, 999));

      // 2. Fetch User
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        console.warn(`User ${userId} not found during evaluation.`);
        return;
      }

      // 3. Fetch Targets (RoutineExercises)
      const routine = await prisma.routineExercise.findMany({
        where: { userId: user.id },
      });

      if (routine.length === 0) {
        // No routine set, nothing to evaluate.
        return;
      }

      // 4. Fetch Logs for Yesterday
      const logs = await prisma.dailyLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      });

      // 5. Evaluate Performance
      let completedCount = 0;

      for (const target of routine) {
        // Find if they logged this exercise
        const log = logs.find((l) => l.exerciseId === target.exerciseId);

        if (log) {
          // Simplistic matching: if a log exists, we consider it completed
          // A full implementation would compare log.metrics with target.targetMetrics
          // For now, based on instructions, we calculate simple ratio
          // e.g., if target JSON was { reps: 20 } and log JSON was { reps: 20 } -> completed
          // We assume any log presence counts as fulfilling that part of the routine for now
          // to demonstrate the streak engine structure. Let's do a basic structure.
          completedCount++;
        }
      }

      const completionRatio = completedCount / routine.length;
      
      let newCoins = user.coins;
      let newStreak = user.currentStreak;
      let newFreezes = user.streakFreezes;
      let dayResult = 'Failed';

      if (completionRatio === 1) {
        // Perfect Day (100%)
        dayResult = 'Perfect';
        newCoins += 10;
        newStreak += 1;
      } else if (completionRatio >= 0.3) {
        // Saved Day (e.g., >= 30%)
        dayResult = 'Saved';
        // newCoins unchanged
        newStreak += 1;
      } else {
        // Failed Day - Check for Freezes!
        if (newFreezes > 0) {
          dayResult = 'Frozen';
          newFreezes -= 1;
          // Streak is maintained (not incremented, not reset)
        } else {
          dayResult = 'Failed';
          // Reset streak
          newStreak = 0; 
        }
      }

      console.log(`User ${userId} - Ratio: ${completionRatio.toFixed(2)} - Result: ${dayResult}`);

      // 6. Update User profile
      await prisma.user.update({
        where: { id: userId },
        data: {
          coins: newCoins,
          currentStreak: newStreak,
          streakFreezes: newFreezes,
        },
      });

      // 7. Upsert DailySummary for permanent record
      const summaryDate = new Date(Date.UTC(yesterdayStart.getUTCFullYear(), yesterdayStart.getUTCMonth(), yesterdayStart.getUTCDate()));
      await prisma.dailySummary.upsert({
        where: {
          userId_date: {
            userId: userId,
            date: summaryDate,
          }
        },
        update: {
          status: dayResult,
        },
        create: {
          userId: userId,
          date: summaryDate,
          status: dayResult,
        }
      });

      return {
        userId,
        dayResult,
        completionRatio,
        newStreak,
        newCoins
      };

    } catch (error) {
      console.error(`Error evaluating streak for user ${userId}:`, error);
    }
  }
}
