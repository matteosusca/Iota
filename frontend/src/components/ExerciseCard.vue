<script setup lang="ts">
import { computed } from 'vue';
import CounterInput from './CounterInput.vue';
import TimerInput from './TimerInput.vue';
import { useHabitStore } from '../stores/habitStore';

const props = defineProps<{
  exercise: {
    id: string;
    name: string;
    type: string;
  }
}>();

const store = useHabitStore();

// Strategy Pattern dynamically picks the component based on the backend Exercise type
const inputComponent = computed(() => {
  return props.exercise.type === 'counter' ? CounterInput : TimerInput;
});

const handleSave = async (metrics: any) => {
  await store.saveDailyLog(props.exercise.id, props.exercise.type, metrics);
};
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-6 mb-6 hover:shadow-md transition-shadow">
    <div class="flex items-center gap-3 w-full border-b border-gray-50 pb-4">
      <div class="w-10 h-10 rounded-full bg-green-50 flex flex-shrink-0 items-center justify-center text-green-600">
        <!-- Minimal placeholder icon depending on type -->
        <svg v-if="exercise.type === 'counter'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800">{{ exercise.name }}</h3>
        <p class="text-sm text-gray-400 capitalize">{{ exercise.type }}</p>
      </div>
    </div>
    
    <component 
      :is="inputComponent" 
      :exerciseId="exercise.id"
      @save="handleSave"
    />
  </div>
</template>
