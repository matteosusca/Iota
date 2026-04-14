import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbService } from '../services/db.service';
import type { UserRoutine } from '../services/db.service';
import { getCurrentTimestamp } from '../services/time.service';
import { syncService } from '../services/sync.service';

export const useRoutineStore = defineStore('routine', () => {
  const activeRoutine = ref<UserRoutine | null>(null);

  // Load from offline storage
  async function loadRoutine(userId: string) {
    const routineId = `routine_${userId}`;
    const storedRoutine = await dbService.getRoutine(routineId);
    
    if (storedRoutine) {
      activeRoutine.value = storedRoutine;
    }
    return activeRoutine.value;
  }

  // Save to state and offline storage
  async function saveRoutine(userId: string, exercises: UserRoutine['exercises']) {
    const routineId = `routine_${userId}`;
    const newRoutine: UserRoutine = {
      id: routineId,
      userId,
      exercises,
      updatedAt: getCurrentTimestamp()
    };
    
    activeRoutine.value = newRoutine;
    const rawData = JSON.parse(JSON.stringify(newRoutine));
    await dbService.putRoutine(rawData);

    // Sync to backend asynchronously
    syncService.syncWithBackend(`/api/v1/routine`, 'PUT', rawData);
  }

  return { activeRoutine, loadRoutine, saveRoutine };
});
