<script setup lang="ts">
import { computed } from 'vue';
import type { ExerciseProgress } from '../types';

const props = defineProps<{ exercise: ExerciseProgress }>();
const emit = defineEmits<{ (e: 'update', id: string, delta: number): void }>();

const isCompleted = computed(() => props.exercise.progress >= props.exercise.target);
</script>

<template>
  <div class="p-4 rounded-2xl border transition-colors flex items-center justify-between"
       :class="isCompleted ? 'bg-green-950/20 border-green-500/50' : 'bg-slate-900 border-slate-800'">
    
    <div class="flex-1" :class="{'opacity-75': isCompleted}">
      <h3 class="text-xl font-semibold mb-1">{{ exercise.name }}</h3>
      <p class="text-slate-400 font-mono text-lg">
        <span :class="isCompleted ? 'text-green-400' : 'text-white'">{{ exercise.progress }}</span> 
        / {{ exercise.target }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button @click="emit('update', exercise.id, -1)" 
              class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 active:scale-95 transition-transform disabled:opacity-50"
              :disabled="exercise.progress <= 0">
        <span class="text-2xl font-bold leading-none">-</span>
      </button>
      <button @click="emit('update', exercise.id, 1)" 
              class="w-16 h-16 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-transform"
              :class="isCompleted ? 'text-green-500' : 'text-white'">
        <span class="text-3xl font-bold leading-none">+</span>
      </button>
    </div>

  </div>
</template>
