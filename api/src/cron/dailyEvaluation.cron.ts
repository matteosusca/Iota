import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { StreakService } from '../services/streak.service';

const prisma = new PrismaClient();

// "Night-Owl Timezone" configuration
// Run every day at 03:01 AM
const SCHEDULE = '1 3 * * *';

export const startDailyEvaluationCron = () => {
  cron.schedule(SCHEDULE, async () => {
    console.log(`[CRON] Starting Daily Evaluation Job at ${new Date().toISOString()}`);

    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      
      console.log(`[CRON] Found ${users.length} users to evaluate.`);

      for (const user of users) {
        await StreakService.evaluateYesterday(user.id);
      }

      console.log(`[CRON] Daily Evaluation Job completed successfully.`);
    } catch (error) {
      console.error(`[CRON] Error during Daily Evaluation Job:`, error);
    }
  });

  console.log(`[CRON] Registered Daily Evaluation Job with schedule: ${SCHEDULE}`);
};
