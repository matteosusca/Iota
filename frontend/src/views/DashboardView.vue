<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRoutineStore } from '../stores/routineStore';
import { useLogStore } from '../stores/logStore';
import { dbService } from '../services/db.service';
import { calculateStreak } from '../services/streak.service';
import TimelineGrid from '../components/TimelineGrid.vue';
import CounterCard from '../components/CounterCard.vue';
import TimerCard from '../components/TimerCard.vue';
import LoadingView from '../components/LoadingView.vue';
import { getNow, getLogicalDate } from '../services/time.service';

const authStore = useAuthStore();
const routineStore = useRoutineStore();
const logStore = useLogStore();

const isLoading = ref(true);

const streakCount = computed(() => authStore.streakCount);

onMounted(async () => {
  if (!routineStore.activeRoutine) {
    await routineStore.loadRoutine(authStore.deviceId);
  }
  
  if (routineStore.activeRoutine) {
    await logStore.loadTodayLog(authStore.deviceId, routineStore.activeRoutine);
  }
  
  // Authoritative background fetch
  authStore.fetchProfile();
  
  isLoading.value = false;
});

const handleExerciseUpdate = async (id: string, delta: number) => {
  await logStore.updateExerciseProgress(id, delta);
  // Re-calculate streak locally for optimistic update
  const dates: string[] = [];
  const now = getNow();
  for (let i = 0; i < 90; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(getLogicalDate(d));
  }
  const pastLogs = await dbService.getPastDays(authStore.deviceId, dates);
  const newStreak = calculateStreak(pastLogs);
  authStore.setStreakCount(newStreak);
};

const streakText = computed(() => {
  if (logStore.currentLog?.status === 'saved') {
    return `❄️ Day ${streakCount.value}`;
  }
  return `🔥 Day ${streakCount.value}`;
});

const streakLabel = computed(() => {
  if (logStore.currentLog?.status === 'saved') {
    return 'Streak Saved';
  }
  return 'Current Streak';
});
</script>

<template>
  <div v-if="!isLoading" class="px-6 py-8 max-w-lg mx-auto space-y-10">
    <section class="text-center mt-4">
      <h1 class="text-5xl font-black tracking-tight text-white mb-2"
          :class="{'text-blue-200': logStore.currentLog?.status === 'saved'}">
        {{ streakText }}
      </h1>
      <p class="font-medium tracking-wide uppercase text-sm"
         :class="logStore.currentLog?.status === 'saved' ? 'text-blue-400' : 'text-slate-500'">
        {{ streakLabel }}
      </p>
      <p class="text-[11px] text-slate-600 mt-2 max-w-[200px] mx-auto leading-tight font-medium">
        Complete <span class="text-green-500/80">100%</span> of today's goals to keep the fire alive
      </p>
    </section>

    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold tracking-wider text-slate-400 uppercase">The Last 4 Weeks</h2>
      </div>
      <TimelineGrid />
    </section>

    <section>
      <div class="flex items-end justify-between mb-4">
        <h2 class="text-2xl font-bold">Today</h2>
        <span class="text-green-500 font-mono text-xl">{{ logStore.currentLog?.completionPercentage || 0 }}%</span>
      </div>
      
      <div class="w-full bg-slate-900 h-2 rounded-full mb-8 relative overflow-hidden">
        <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10"></div>
        <div class="h-full bg-green-500 transition-all duration-500" 
             :class="{'bg-blue-400': logStore.currentLog && logStore.currentLog.completionPercentage >= 50 && logStore.currentLog.completionPercentage < 100}"
             :style="`width: ${logStore.currentLog?.completionPercentage || 0}%`"></div>
      </div>

      <div class="space-y-4">
        <template v-for="exercise in logStore.currentLog?.exercisesSnapshot" :key="exercise.id">
          <CounterCard v-if="exercise.type === 'counter'" 
                       :exercise="exercise" 
                       @update="handleExerciseUpdate" />
          
          <TimerCard v-else-if="exercise.type === 'timer'"
                     :exercise="exercise" />
        </template>
      </div>
    </section>
  </div>
  <LoadingView v-else />
</template>
