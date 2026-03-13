<template>
  <div class="bg-gray-900 rounded-xl shadow-box border border-gray-800 p-4 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Consistency</h3>
      <span class="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded-md">{{ currentMonthName }}</span>
    </div>
    
    <!-- Render the Grid: 7 Cols. The template iterates over total days. -->
    <div class="grid grid-cols-7 gap-1 sm:gap-2">
      <div 
        v-for="day in daysInMonth" 
        :key="day.dateStr"
        :class="['h-6 sm:h-8 rounded-sm sm:rounded-md transition-colors duration-300 ease-in-out', getColorClass(day.status)]"
        :title="`${day.dateStr}: ${day.status || 'No Data'}`"
      ></div>
    </div>
    
    <!-- Legend -->
    <div class="flex items-center gap-4 mt-4 text-[10px] text-gray-500 font-medium uppercase tracking-wider justify-center">
      <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div> Perfect</div>
      <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-emerald-400/50"></div> Saved</div>
      <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-blue-500"></div> Frozen</div>
      <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-sm bg-gray-800"></div> Missed</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useHabitStore } from '../stores/habitStore';

const store = useHabitStore();

const now = new Date();
const currentYear = now.getUTCFullYear();
const currentMonth = now.getUTCMonth(); // 0-indexed

// Formatting month name for the header
const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(currentYear, currentMonth, 1));
});

// Calculate total days in the month
const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

// Array of days containing their YYYY-MM-DD string and matching status from store
const daysInMonth = computed(() => {
  const result = [];
  const monthStr = String(currentMonth + 1).padStart(2, '0');
  
  for (let d = 1; d <= totalDays; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    
    // Find matching history entry
    const entry = store.history.find(h => h.date === dateStr);
    
    result.push({
      dateStr,
      status: entry ? entry.status : 'None'
    });
  }
  return result;
});

// Helper to determine tailwind classes
const getColorClass = (status: string) => {
  switch (status) {
    case 'Perfect': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    case 'Saved': return 'bg-emerald-400/50';
    case 'Frozen': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    case 'Failed':
    case 'None':
    default: 
      return 'bg-gray-800 border border-gray-700/50';
  }
};
</script>
