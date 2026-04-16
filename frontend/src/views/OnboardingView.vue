<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoutineStore } from '../stores/routineStore';
import { useAuthStore } from '../stores/authStore';
import type { ExerciseDefinition } from '../types';
import { notificationService } from '../services/notification.service';

const router = useRouter();
const routineStore = useRoutineStore();
const authStore = useAuthStore();

const exercises = ref<Partial<ExerciseDefinition>[]>([
  { id: crypto.randomUUID(), name: '', type: 'counter', target: 10, order: 1 }
]);

const isSubmitting = ref(false);

const addExercise = () => {
  exercises.value.push({
    id: crypto.randomUUID(),
    name: '',
    type: 'counter',
    target: 10,
    order: exercises.value.length + 1
  });
};

const removeExercise = (index: number) => {
  if (exercises.value.length > 1) {
    exercises.value.splice(index, 1);
  }
};

const startStreak = async () => {
  // Validate empty fields
  const validExercises = exercises.value.filter(ex => ex.name?.trim() !== '');
  if (validExercises.length === 0) {
    alert('Please enter at least one exercise to start.');
    return;
  }

  isSubmitting.value = true;

  const finalExercises: ExerciseDefinition[] = validExercises.map((ex, idx) => ({
    id: ex.id!,
    name: ex.name!,
    type: ex.type as 'counter' | 'timer',
    target: Number(ex.target) || 1,
    order: idx + 1
  }));

  try {
    // Store and sync globally
    await routineStore.saveRoutine(authStore.deviceId, finalExercises);
    
    // Request Notifications permission and subscribe (Don't await completely if it takes too long, or run in background)
    // We'll trigger it and then move on to improve UX
    notificationService.requestPermission().then(granted => {
      if (granted) {
        notificationService.subscribeUser();
      }
    }).catch(e => console.error('Notification error:', e));

    // Custom event to trigger PWA install dynamically. 
    window.dispatchEvent(new CustomEvent('trigger-pwa-prompt'));

    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Failed to start streak:', error);
    alert('Something went wrong. Please try again.');
  } finally {
    // We don't necessarily set isSubmitting to false here because we're redirecting
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 max-w-md mx-auto">
    <h1 class="text-3xl font-light mb-8 tracking-wide text-center">Don't break the chain.</h1>
    
    <div class="w-full space-y-6">
      <div v-for="(ex, index) in exercises" :key="ex.id" class="bg-slate-900 border border-slate-800 p-4 rounded-xl relative">
        <button v-if="exercises.length > 1" @click="removeExercise(index)" class="absolute -top-2 -right-2 bg-red-900/50 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-800 transition-colors">&times;</button>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1 tracking-wider uppercase">Name</label>
            <input v-model="ex.name" :disabled="isSubmitting" type="text" placeholder="e.g., Push-ups" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-green-500 transition-colors placeholder:text-slate-700 disabled:opacity-50">
          </div>
          
          <div class="flex gap-4">
             <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-500 mb-1 tracking-wider uppercase">Type</label>
              <select v-model="ex.type" :disabled="isSubmitting" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-green-500 transition-colors appearance-none disabled:opacity-50">
                <option value="counter">Reps (Counter)</option>
                <option value="timer">Time (Seconds)</option>
              </select>
             </div>
             <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-500 mb-1 tracking-wider uppercase">Target</label>
              <input v-model="ex.target" :disabled="isSubmitting" type="number" min="1" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50">
             </div>
          </div>
        </div>
      </div>
      
      <button @click="addExercise" :disabled="isSubmitting" class="w-full py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 font-semibold hover:border-slate-600 hover:text-slate-300 transition-colors disabled:opacity-50">
        + Add another exercise
      </button>

      <button @click="startStreak" :disabled="isSubmitting" class="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-8 flex items-center justify-center disabled:opacity-70 disabled:transform-none">
        <template v-if="isSubmitting">
          <svg class="animate-spin h-6 w-6 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Starting...
        </template>
        <template v-else>
          Start my Streak
        </template>
      </button>
    </div>
  </div>
</template>
