<script setup lang="ts">
import { ref } from 'vue';
import ExerciseCard from './components/ExerciseCard.vue';

// Fallback routine array, since we don't have the explicit API fetches for the routine structure yet.
// These map to the seeded exercises.
const exercises = ref([
  { id: '11111111-1111-1111-1111-111111111111', name: 'Push-ups', type: 'counter' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Stretching', type: 'timer' }
]);
</script>

<template>
  <div class="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-green-100">
    <header class="pt-12 pb-8 px-6 sticky top-0 bg-[#F9FAFB]/80 backdrop-blur-md z-10 border-b border-gray-100">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-gray-900">Kaizen<span class="text-green-600">Fit</span></h1>
          <p class="text-sm font-medium text-gray-500 mt-1">Groundhog Day Routine</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
           <span class="text-xl font-bold text-green-600">🔥</span>
        </div>
      </div>
    </header>

    <main class="p-6 max-w-md mx-auto pt-8 pb-24">
      <div v-if="exercises.length > 0">
        <ExerciseCard 
          v-for="exercise in exercises" 
          :key="exercise.id" 
          :exercise="exercise" 
        />
      </div>
      <div v-else class="text-center text-gray-400 mt-12">
        <p>No exercises scheduled for today.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
