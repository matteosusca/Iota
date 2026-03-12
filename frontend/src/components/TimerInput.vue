<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

const props = defineProps<{
  exerciseId: string;
}>();

const emit = defineEmits<{
  (e: 'save', payload: { seconds_elapsed: number }): void;
}>();

const secondsElapsed = ref(0);
const isRunning = ref(false);
let timerInterval: number | null = null;

const formatTime = computed(() => {
  const m = Math.floor(secondsElapsed.value / 60).toString().padStart(2, '0');
  const s = (secondsElapsed.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const toggleTimer = () => {
  if (isRunning.value) {
    if (timerInterval) clearInterval(timerInterval);
    isRunning.value = false;
  } else {
    isRunning.value = true;
    timerInterval = window.setInterval(() => {
      secondsElapsed.value++;
    }, 1000);
  }
};

const handleSave = () => {
  if (isRunning.value) {
    toggleTimer();
  }
  if (secondsElapsed.value > 0) {
    emit('save', { seconds_elapsed: secondsElapsed.value });
    secondsElapsed.value = 0; // Reset after save
  }
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <div class="text-5xl font-mono font-bold text-gray-800 tracking-wider">
      {{ formatTime }}
    </div>
    
    <div class="flex gap-4 w-full mt-2">
      <button @click="toggleTimer" :class="[
        'flex-1 py-3 rounded-xl font-semibold transition-colors shadow-sm',
        isRunning ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      ]">
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
      <button @click="handleSave" class="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" :disabled="secondsElapsed === 0">
        Log Time
      </button>
    </div>
  </div>
</template>
