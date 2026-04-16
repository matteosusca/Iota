import cron from 'node-cron';
import webpush from 'web-push';
import { PrismaClient, Prisma } from '@prisma/client';
import { getLogicalDate } from './time.service';

class NotificationCron {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async setupVapid() {
    let publicKeySetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'VAPID_PUBLIC_KEY' }
    });
    let privateKeySetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'VAPID_PRIVATE_KEY' }
    });

    if (!publicKeySetting || !privateKeySetting) {
      const vapidKeys = webpush.generateVAPIDKeys();
      
      publicKeySetting = await this.prisma.systemSetting.upsert({
        where: { key: 'VAPID_PUBLIC_KEY' },
        update: { value: vapidKeys.publicKey },
        create: { key: 'VAPID_PUBLIC_KEY', value: vapidKeys.publicKey }
      });
      
      privateKeySetting = await this.prisma.systemSetting.upsert({
        where: { key: 'VAPID_PRIVATE_KEY' },
        update: { value: vapidKeys.privateKey },
        create: { key: 'VAPID_PRIVATE_KEY', value: vapidKeys.privateKey }
      });
    }
    
    webpush.setVapidDetails(
      'mailto:support@iota.app',
      publicKeySetting.value,
      privateKeySetting.value
    );
  }

  async checkAndSendReminders() {
    const logicalDateStr = getLogicalDate();
    const logicalDate = new Date(logicalDateStr);

    try {
      // Find users with their log for the current logical day
      const usersWithIncompleteLogs = await this.prisma.user.findMany({
        where: {
          pushSubscription: { not: Prisma.JsonNull },
          dailyLogs: {
            some: {
              logicalDate: logicalDate,
              completionPercentage: { lt: 50 }
            }
          }
        },
        include: {
          dailyLogs: {
            where: {
              logicalDate: logicalDate
            }
          }
        }
      });

      console.log(`[Cron] Found ${usersWithIncompleteLogs.length} users with incomplete logs (< 50%).`);

      for (const user of usersWithIncompleteLogs) {
        if (user.pushSubscription) {
          try {
            const payload = JSON.stringify({
              title: 'Iota Reminder',
              body: 'Don\'t break your streak! You are less than 50% through today\'s routine.',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              data: {
                url: '/'
              }
            });

            await webpush.sendNotification(user.pushSubscription as any, payload);
            console.log(`[Cron] Sent reminder to user ${user.id}`);
          } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
              // Subscription expired or no longer valid
              console.log(`[Cron] Removing invalid subscription for user ${user.id}`);
              await this.prisma.user.update({
                where: { id: user.id },
                data: { pushSubscription: Prisma.JsonNull }
              });
            } else {
              console.error(`[Cron] Error sending notification to user ${user.id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Cron] Error in checkAndSendReminders:', error);
    }
  }

  async init() {
    await this.setupVapid();
    
    // Schedule hourly check
    cron.schedule('0 * * * *', () => {
      console.log('[Cron] Running hourly reminder check...');
      this.checkAndSendReminders();
    });
    console.log('[Cron] Notification cron job initialized.');
  }
}

export const notificationCron = new NotificationCron();
