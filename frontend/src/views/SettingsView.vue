<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoutineStore } from '../stores/routineStore';
import { useAuthStore } from '../stores/authStore';
import { getDB } from '../services/db.service';
import type { UserRoutine } from '../types';

const authStore = useAuthStore();
const routineStore = useRoutineStore();

const localBaseRoutine = ref<UserRoutine | null>(null);

onMounted(async () => {
  if (!routineStore.activeRoutine) {
    await routineStore.loadRoutine(authStore.deviceId);
  }
  if (routineStore.activeRoutine) {
    localBaseRoutine.value = JSON.parse(JSON.stringify(routineStore.activeRoutine));
  }
});

const isSaved = ref(false);

const saveSettings = async () => {
  if (localBaseRoutine.value) {
    await routineStore.saveRoutine(authStore.deviceId, localBaseRoutine.value.exercises);
    isSaved.value = true;
    setTimeout(() => {
      isSaved.value = false;
    }, 2500);
  }
};

const addExercise = () => {
  if (localBaseRoutine.value) {
    const id = `ex_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder = localBaseRoutine.value.exercises.length > 0 
      ? Math.max(...localBaseRoutine.value.exercises.map(e => e.order)) + 1 
      : 1;
    localBaseRoutine.value.exercises.push({
      id,
      name: 'New Exercise',
      type: 'counter',
      target: 10,
      order: newOrder
    });
  }
};

const removeExercise = (index: number) => {
  if (localBaseRoutine.value) {
    localBaseRoutine.value.exercises.splice(index, 1);
  }
};

const handleExport = async () => {
  try {
    const db = await getDB();
    const routines = await db.getAll('routines');
    const logs = await db.getAll('daily_logs');
    const data = { routines, logs };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaizenfit-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export data.');
  }
};

const fileInput = ref<HTMLInputElement | null>(null);
const triggerImport = () => {
  fileInput.value?.click();
};

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.routines && !data.logs) {
      throw new Error('Invalid backup file structure');
    }

    const db = await getDB();
    const tx = db.transaction(['routines', 'daily_logs'], 'readwrite');
    
    if (data.routines) {
      for (const r of data.routines) {
        await tx.objectStore('routines').put(r);
      }
    }
    if (data.logs) {
      for (const l of data.logs) {
        await tx.objectStore('daily_logs').put(l);
      }
    }
    
    await tx.done;
    await routineStore.loadRoutine(authStore.deviceId);
    alert('Import successful! Reloading view.');
    window.location.reload();
  } catch (error) {
    console.error('Import failed:', error);
    alert('Failed to import data: ' + (error as Error).message);
  } finally {
    if (target) target.value = ''; 
  }
};

</script>

<template>
  <div class="px-6 py-8 max-w-lg mx-auto space-y-10">
    <h1 class="text-3xl font-black text-white">Settings</h1>
    
    <section v-if="localBaseRoutine" class="space-y-6">
      <h2 class="text-lg font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-2">Edit Routine</h2>
      
      <div v-for="(ex, index) in localBaseRoutine.exercises" :key="ex.id" class="flex flex-col gap-2 relative bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div class="flex justify-between items-center mb-1">
           <label class="text-sm font-semibold text-slate-300">Exercise {{ index + 1 }}</label>
           <button @click="removeExercise(index)" class="text-red-400 hover:text-red-300 text-xs font-semibold uppercase tracking-wider">Remove</button>
        </div>
        <div class="flex gap-3">
           <input v-model="ex.name" type="text" placeholder="Name" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 placeholder-slate-600 min-w-0">
           <div class="relative flex-shrink-0">
             <select v-model="ex.type" class="appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-white outline-none focus:border-green-500 cursor-pointer h-full text-sm">
               <option value="counter">Reps</option>
               <option value="timer">Secs</option>
             </select>
             <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
               <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
               </svg>
             </div>
           </div>
           <input v-model.number="ex.target" type="number" min="1" class="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-center focus:outline-none focus:border-green-500">
        </div>
      </div>
      
      <button @click="addExercise" class="w-full py-4 border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-slate-400 hover:text-white font-bold rounded-xl transition-all shrink-0">
        + Add Exercise
      </button>

      <button @click="saveSettings" 
              class="w-full py-4 mt-6 text-white font-bold rounded-xl transition-all shrink-0 relative overflow-hidden"
              :class="isSaved ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(22,163,74,0.3)]'">
        <span class="inline-block transition-transform duration-300" :class="isSaved ? 'scale-110' : 'scale-100'">
          {{ isSaved ? '✓ Saved Successfully!' : 'Save Routine Updates' }}
        </span>
      </button>
      <p class="text-xs text-slate-500 text-center">Changes apply to future days only. Past logs remain unchanged.</p>
    </section>

    <section class="space-y-6 pt-6 border-t border-slate-800">
      <h2 class="text-lg font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-2">Data Management</h2>
      <div class="flex flex-col gap-4">
        <button @click="handleExport" class="w-full py-4 border border-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-900 hover:border-slate-500 transition-colors">
          Download Backup (JSON)
        </button>
        
        <input type="file" ref="fileInput" class="hidden" accept=".json" @change="handleImport">
        <button @click="triggerImport" class="w-full py-4 border border-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-900 hover:border-slate-500 transition-colors">
          Restore from Backup
        </button>
      </div>
    </section>
  </div>
</template>
