import cron from 'node-cron';
import { PrismaClient, Prisma } from '@prisma/client';
import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@kaizenfit.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Run every day at 20:00 (8:00 PM)
const SCHEDULE = '0 20 * * *';

export const startSmartRemindersCron = () => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    console.warn('[CRON] VAPID keys not configured. Smart Reminders will not start.');
    return;
  }

  cron.schedule(SCHEDULE, async () => {
    console.log(`[CRON] Starting Smart Reminders Job at ${new Date().toISOString()}`);

    try {
      // Find all users who have a push subscription
      const users = await prisma.user.findMany({
        where: {
          pushSubscription: { not: undefined } // or not: null
        },
        select: {
          id: true,
          pushSubscription: true
        }
      });

      console.log(`[CRON] Found ${users.length} subscribed users to evaluate for reminders.`);

      // Calculate the start of the "tracking day" (e.g., 03:00 AM today)
      const trackingStart = new Date();
      if (trackingStart.getHours() < 3) {
         trackingStart.setDate(trackingStart.getDate() - 1);
      }
      trackingStart.setHours(3, 0, 0, 0);

      let sentCount = 0;

      for (const user of users) {
        if (!user.pushSubscription) continue;

        // Check if they have logged ANY exercise since the tracking start
        const logsCount = await prisma.dailyLog.count({
          where: {
            userId: user.id,
            date: { gte: trackingStart }
          }
        });

        // If they have no logs today, alert them
        if (logsCount === 0) {
          try {
            const payload = JSON.stringify({
              title: 'KaizenFit Reminder',
              body: "Zen Reminder: You haven't trained today! Complete your routine to save the streak."
            });
            
            // The pushSubscription stored in DB matches what web-push expects
            await webpush.sendNotification(user.pushSubscription as unknown as webpush.PushSubscription, payload);
            sentCount++;
          } catch (pushErr: any) {
            console.error(`[CRON] Failed to send push to user ${user.id}:`, pushErr.statusCode);
            // Optionally: if status is 410 (Gone), delete the subscription from the DB.
            if (pushErr.statusCode === 410) {
              await prisma.user.update({
                where: { id: user.id },
                data: { pushSubscription: Prisma.DbNull }
              });
            }
          }
        }
      }

      console.log(`[CRON] Smart Reminders Job completed. Sent ${sentCount} reminders.`);
    } catch (error) {
      console.error(`[CRON] Error during Smart Reminders Job:`, error);
    }
  });

  console.log(`[CRON] Registered Smart Reminders Job with schedule: ${SCHEDULE}`);
};
