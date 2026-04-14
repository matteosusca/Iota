import type { DailyLog } from './db.service';
import { getLogicalDate, getNow } from './time.service';

export interface StreakInfo {
  count: number;
  status: 'active' | 'frozen' | 'broken';
}

export function calculateStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  // Sort logs by date descending (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.logicalDate).getTime() - new Date(a.logicalDate).getTime()
  );

  const today = getLogicalDate();
  const yesterdayDate = getNow();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLogicalDate(yesterdayDate);

  let streak = 0;
  let currentDate = today;

  // Find where to start: if today is completed, start from today.
  // If today is not completed (or saved), but yesterday was >= 50%, start from yesterday.
  
  const logMap = new Map(sortedLogs.map(l => [l.logicalDate, l]));

  // Streak logic:
  // 1. A day is "successful" if status is 'completed' (100%).
  // 2. A day is "frozen" if status is 'saved' (>= 50%).
  // 3. A day is "failed" if status is 'failed' (< 50%).
  
  // We count consecutive 'completed' days.
  // 'saved' days do NOT increment the streak, but they do NOT break it either.
  
  // Actually, the PRODUCT_VISION says:
  // "100% Completion (Victory): The user completes all exercises. The Streak increases by +1."
  // ">= 50% Completion (Saved/Frozen): ... The Streak is frozen (does not increase, but is not lost)."
  // "< 50% Completion (Failed): The Streak resets to 0."

  // Iterate backwards from today
  const checkDate = getNow();
  // Adjust for 04:00 AM reset if needed? getLogicalDate already handles this.
  
  // We need to look at all days in sequence.
  let daysBack = 0;
  while (true) {
    const d = getNow();
    d.setHours(d.getHours() - 4); // Logical offset
    d.setDate(d.getDate() - daysBack);
    const dateStr = d.toISOString().split('T')[0];
    
    const log = logMap.get(dateStr);
    
    if (log) {
      if (log.status === 'completed') {
        streak++;
      } else if (log.status === 'saved') {
        // Frozen, keep going but don't increment
      } else {
        // Failed today? If it's today, we haven't failed yet until the day ends.
        // Wait, the logic is usually: if you haven't finished today, the streak from yesterday still shows.
        if (dateStr === today) {
          // Skip today if it's failed, just check yesterday
        } else {
          break; // Broken
        }
      }
    } else {
      if (dateStr === today) {
        // Skip today if no log yet
      } else {
        break; // No log for a past day = broken streak
      }
    }
    
    daysBack++;
    if (daysBack > 1000) break; // Safety
  }

  return streak;
}
