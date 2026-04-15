import { PrismaClient } from '@prisma/client';
import { getLogicalDate } from './time.service';

const prisma = new PrismaClient();

/**
 * Calculates the current streak for a user based on their past 90 days of logs.
 * A streak is incremented by 100% (completed) days and remains frozen on >= 50% (saved) days.
 * Anything else breaks the streak.
 */
export async function calculateUserStreak(userId: string): Promise<number> {
  const logs = await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { logicalDate: 'desc' },
    take: 90
  });

  if (logs.length === 0) return 0;

  const todayStr = getLogicalDate();
  
  // Map for O(1) lookup
  const logMap = new Map(logs.map(l => [l.logicalDate.toISOString().split('T')[0], l]));

  let streak = 0;
  let daysBack = 0;

  // We look back from today
  while (daysBack < 90) {
    const d = new Date();
    // Offset by 4 hours to match logical day cutoff
    d.setHours(d.getHours() - 4);
    d.setDate(d.getDate() - daysBack);
    const dateStr = d.toISOString().split('T')[0];
    
    const log = logMap.get(dateStr);
    
    if (log) {
      if (log.status === 'completed') {
        streak++;
      } else if (log.status === 'saved') {
        // Frozen: don't increment, but don't break.
      } else {
        // Failed (< 50%)
        if (dateStr !== todayStr) {
          break; // Broken
        }
      }
    } else {
      // No log found for this day
      if (dateStr !== todayStr) {
        break; // Broken (missed a past day)
      }
    }
    
    daysBack++;
  }

  return streak;
}
