<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDocumentVisibility, useIntervalFn } from '@vueuse/core';
import { useLogStore } from '../stores/logStore';
import { useAuthStore } from '../stores/authStore';
import { useRoutineStore } from '../stores/routineStore';

const route = useRoute();
const router = useRouter();
const logStore = useLogStore();
const authStore = useAuthStore();
const routineStore = useRoutineStore();
const visibility = useDocumentVisibility();

const exerciseId = route.params.id as string;
const isLoading = ref(true);

const exercise = computed(() => 
  logStore.currentLog?.exercisesSnapshot.find(ex => ex.id === exerciseId)
);

const isPlaying = ref(false);
const startTime = ref<number | null>(null);
const baseSeconds = ref(0);
const displaySeconds = ref(0);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const { pause: stopInterval, resume: startInterval } = useIntervalFn(() => {
  if (isPlaying.value && startTime.value) {
    const now = Date.now();
    const elapsedSinceStart = Math.floor((now - startTime.value) / 1000);
    displaySeconds.value = baseSeconds.value + elapsedSinceStart;
  }
}, 100, { immediate: false }); // High frequency check for smooth UI, actual math is time-based

const commitTime = async () => {
  const currentElapsed = displaySeconds.value - (exercise.value?.progress || 0);
  if (currentElapsed > 0) {
    await logStore.updateExerciseProgress(exerciseId, currentElapsed);
    // After committing, baseSeconds should be the NEW progress
    if (exercise.value) {
      baseSeconds.value = exercise.value.progress;
    }
  }
};

const pauseTimer = async () => {
  if (!isPlaying.value) return;
  isPlaying.value = false;
  stopInterval();
  await commitTime();
  startTime.value = null;
};

const playTimer = () => {
  if (isPlaying.value) return;
  isPlaying.value = true;
  startTime.value = Date.now();
  baseSeconds.value = displaySeconds.value;
  startInterval();
};

const toggleTimer = () => {
  isPlaying.value ? pauseTimer() : playTimer();
};

const finishExercise = async () => {
  if (isPlaying.value) {
    await pauseTimer();
  } else {
    await commitTime();
  }
  router.push({ name: 'dashboard' });
};

const cancelExercise = () => {
  if (isPlaying.value) {
    isPlaying.value = false;
    stopInterval();
    startTime.value = null;
  }
  router.push({ name: 'dashboard' });
};

watch(visibility, async (current) => {
  if (current === 'hidden') {
    if (isPlaying.value) {
      console.log("Browser hidden, auto-pausing the timer!");
      await pauseTimer();
    }
  }
});

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initAuth();
  }
  
  if (!routineStore.activeRoutine) {
    await routineStore.loadRoutine(authStore.deviceId);
  }

  if (!logStore.currentLog && routineStore.activeRoutine) {
    await logStore.loadTodayLog(authStore.deviceId, routineStore.activeRoutine);
  }

  if (!exercise.value) {
    router.push({ name: 'dashboard' });
    return;
  }
  
  displaySeconds.value = exercise.value.progress;
  baseSeconds.value = exercise.value.progress;
  isLoading.value = false;
  
  // Auto-start timer
  if (exercise.value.progress < exercise.value.target) {
    playTimer();
  }
});

onUnmounted(async () => {
  if (isPlaying.value) {
    await commitTime();
  }
});
</script>

<template>
  <div v-if="!isLoading && exercise" class="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50">
    <!-- Close/Back button to cancel without saving 0 seconds -->
    <button @click="cancelExercise" class="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
    </button>

    <div class="flex-1 w-full max-w-md flex flex-col justify-center items-center">
      
      <h2 class="text-2xl text-slate-400 font-semibold mb-12 tracking-widest uppercase">{{ exercise.name }}</h2>
      
      <div class="text-[7rem] font-mono font-black text-white leading-none tracking-tighter mb-4 transition-colors duration-500"
           :class="{'!text-green-500': displaySeconds >= exercise.target}">
        {{ formatTime(displaySeconds) }}
      </div>
      
      <div class="text-2xl font-mono text-slate-600 mb-20 tracking-widest">
         / {{ formatTime(exercise.target) }}
      </div>

    </div>

    <!-- Controls -->
    <div class="w-full max-w-md space-y-4 mb-10">
      <button @click="toggleTimer"
              class="w-full py-6 rounded-2xl text-2xl font-bold transition-all active:scale-95 flex items-center justify-center border-2"
              :class="isPlaying 
                ? 'bg-yellow-600/10 border-yellow-600 text-yellow-500 hover:bg-yellow-600/20 shadow-[0_0_30px_rgba(202,138,4,0.1)]' 
                : 'bg-slate-800 border-transparent hover:bg-slate-700 text-white'">
        <component :is="isPlaying ? 'PauseIcon' : 'PlayIcon'" class="w-8 h-8 mr-3" />
        {{ isPlaying ? 'Pause Timer' : 'Resume Timer' }}
      </button>

      <button @click="finishExercise"
              class="w-full py-6 bg-green-600 hover:bg-green-500 text-white text-2xl font-bold rounded-2xl shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all active:scale-95">
        Finish & Save
      </button>
    </div>
  </div>

  <div v-else-if="isLoading" class="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-500 z-50">
    Initializing Focus Mode...
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';

const PlayIcon = defineComponent({
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M8 5v14l11-7z' })
    ]);
  }
});

const PauseIcon = defineComponent({
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' })
    ]);
  }
});

export default {
  components: { PlayIcon, PauseIcon }
};
</script>

