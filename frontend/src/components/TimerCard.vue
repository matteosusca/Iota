<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ExerciseProgress } from '../types';

const props = defineProps<{ exercise: ExerciseProgress }>();
const router = useRouter();

const isCompleted = computed(() => props.exercise.progress >= props.exercise.target);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="p-4 rounded-2xl border transition-colors flex items-center justify-between"
       :class="isCompleted ? 'bg-green-950/20 border-green-500/50' : 'bg-slate-900 border-slate-800'">
    
    <div class="flex-1" :class="{'opacity-75': isCompleted}">
      <h3 class="text-xl font-semibold mb-1">{{ exercise.name }}</h3>
      <p class="text-slate-400 font-mono text-lg">
        <span :class="isCompleted ? 'text-green-400' : 'text-white'">{{ formatTime(exercise.progress) }}</span> 
        / {{ formatTime(exercise.target) }}
      </p>
    </div>

    <button @click="router.push('/timer/' + exercise.id)" class="w-16 h-16 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-transform text-white group">
      <svg class="w-8 h-8 group-hover:scale-110 transition-transform pl-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  </div>
</template>
