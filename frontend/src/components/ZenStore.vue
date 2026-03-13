<template>
  <div class="mt-8 mb-4 bg-blue-900/20 border border-blue-800/50 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
        <span class="text-2xl" role="img" aria-label="Freeze">❄️</span>
      </div>
      <div>
        <h3 class="text-sm font-bold text-gray-200">Zen Store</h3>
        <p class="text-xs text-gray-400 mt-0.5">Protect your streak from missed days.</p>
        <div class="mt-1 text-xs font-semibold text-blue-400">Inventory: {{ store.userStats.streakFreezes }} Freezes</div>
      </div>
    </div>
    
    <button 
      @click="handleBuyFreeze" 
      :disabled="!canAfford || isBuying"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2',
        canAfford && !isBuying
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer' 
          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
      ]"
    >
      <span v-if="isBuying">Purchasing...</span>
      <template v-else>
        Buy Freeze
        <span class="bg-black/20 px-2 py-0.5 rounded text-xs gap-1 flex items-center">
          10 🪙
        </span>
      </template>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHabitStore } from '../stores/habitStore';

const store = useHabitStore();
const isBuying = ref(false);

const canAfford = computed(() => store.userStats.coins >= 10);

const handleBuyFreeze = async () => {
  if (!canAfford.value || isBuying.value) return;
  
  isBuying.value = true;
  await store.buyFreeze();
  isBuying.value = false;
};
</script>
