<template>
  <div class="flex items-center justify-between w-full p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800 drop-shadow-sm mb-6">
    <div class="flex items-center gap-2">
      <span class="text-2xl" role="img" aria-label="Streak">🔥</span>
      <div class="flex flex-col">
        <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Streak</span>
        <span class="text-xl font-extrabold text-white leading-none tracking-tight">{{ store.userStats.currentStreak }}</span>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <div class="flex flex-col text-right">
        <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Coins</span>
        <span class="text-xl font-extrabold text-white leading-none tracking-tight">{{ store.userStats.coins }}</span>
      </div>
      <span class="text-2xl" role="img" aria-label="Coins">🪙</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHabitStore } from '../stores/habitStore';

const store = useHabitStore();
</script>
