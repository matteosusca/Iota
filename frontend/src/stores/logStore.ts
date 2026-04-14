import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbService } from '../services/db.service';
import type { DailyLog, UserRoutine } from '../services/db.service';
import { getLogicalDate, getCurrentTimestamp } from '../services/time.service';
import { syncService } from '../services/sync.service';

export const useLogStore = defineStore('log', () => {
  const currentLog = ref<DailyLog | null>(null);

  async function loadTodayLog(userId: string, activeRoutine: UserRoutine | null) {
    const logicalDate = getLogicalDate();
    const logId = `${userId}_${logicalDate}`;

    let storedLog = await dbService.getDailyLog(logId);
    
    // Auto-generate empty log structure if it doesn't exist but we have an active routine
    if (!storedLog && activeRoutine) {
      storedLog = {
        id: logId,
        userId,
        logicalDate,
        status: 'failed', // Default
        completionPercentage: 0,
        lastUpdated: getCurrentTimestamp(),
        exercisesSnapshot: activeRoutine.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          type: ex.type,
          target: ex.target,
          progress: 0
        }))
      };
      await dbService.putDailyLog(storedLog);
    }
    
    if (storedLog) {
      currentLog.value = storedLog;
    }
    return currentLog.value;
  }

  async function updateExerciseProgress(exerciseId: string, progressDelta: number) {
    if (!currentLog.value) return;

    const exercise = currentLog.value.exercisesSnapshot.find(e => e.id === exerciseId);
    if (!exercise) return;

    // Mutate state
    exercise.progress = Math.max(0, exercise.progress + progressDelta); // basic bounds

    // Recalculate completion percentage by averaging individual exercise completion percentages
    if (currentLog.value.exercisesSnapshot.length === 0) {
      currentLog.value.completionPercentage = 0;
    } else {
      let sumPercentages = 0;
      currentLog.value.exercisesSnapshot.forEach(ex => {
        let exPercentage = ex.target > 0 ? Math.min(ex.progress, ex.target) / ex.target : 0;
        sumPercentages += exPercentage;
      });
      currentLog.value.completionPercentage = Math.floor((sumPercentages / currentLog.value.exercisesSnapshot.length) * 100);
    }
    currentLog.value.lastUpdated = getCurrentTimestamp();

    if (currentLog.value.completionPercentage === 100) {
      currentLog.value.status = 'completed';
    } else if (currentLog.value.completionPercentage >= 50) {
      currentLog.value.status = 'saved';
    } else {
      currentLog.value.status = 'failed';
    }

    // Persist optimistic logic (strip Vue proxy)
    const rawData = JSON.parse(JSON.stringify(currentLog.value));
    await dbService.putDailyLog(rawData);

    // Sync to backend asynchronously
    syncService.syncWithBackend(`/api/v1/logs/${rawData.logicalDate}`, 'PUT', rawData);
  }

  return { currentLog, loadTodayLog, updateExerciseProgress };
});
