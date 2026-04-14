<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import { syncService } from './services/sync.service';
import { useRoute } from 'vue-router';
import { devOffsetDays, getLogicalDate } from './services/time.service';

const isDev = import.meta.env.DEV;

const authStore = useAuthStore();
const route = useRoute();

const handleOnline = () => {
  syncService.processOfflineQueue();
};

onMounted(async () => {
  // Initialization also happens in router guards, catching here just in case.
  await authStore.initAuth();
  await syncService.processOfflineQueue();
  window.addEventListener('online', handleOnline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
});

const offsetTime = (days: number) => {
  devOffsetDays.value += days;
  setTimeout(() => window.location.reload(), 50);
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
    <!-- Main Content Area -->
    <main class="flex-grow pb-24 relative">
      <router-view />
      
      <!-- Dev Time Machine -->
      <div v-if="isDev" class="fixed top-2 md:top-4 right-2 md:right-4 z-[9999] bg-slate-900 border border-yellow-700/50 rounded-lg shadow-[0_0_30px_rgba(202,138,4,0.1)] flex items-center overflow-hidden">
         <button @click="offsetTime(-1)" class="px-3 md:px-4 py-2 bg-slate-800 text-yellow-600 hover:text-yellow-400 hover:bg-slate-700 transition-colors font-black text-lg sm:text-xl active:bg-slate-600">-</button>
         <div class="px-2 md:px-4 py-1 md:py-2 font-mono text-center flex flex-col justify-center min-w-[120px] bg-slate-950/50">
           <span class="text-[10px] md:text-xs text-yellow-700 font-bold uppercase tracking-widest shadow-sm">Time Travel</span>
           <span class="text-sm md:text-base text-yellow-500 font-bold">{{ getLogicalDate() }}</span>
         </div>
         <button @click="offsetTime(1)" class="px-3 md:px-4 py-2 bg-slate-800 text-yellow-600 hover:text-yellow-400 hover:bg-slate-700 transition-colors font-black text-lg sm:text-xl active:bg-slate-600">+</button>
      </div>
    </main>

    <!-- Bottom Navbar -->
    <nav v-if="route.name && !['onboarding', 'timer'].includes(route.name as string)" class="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex justify-around items-center h-20 shadow-2xl z-50">
      <router-link to="/" class="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors" active-class="!text-green-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span class="text-xs font-semibold tracking-wide">Home</span>
      </router-link>
      <router-link to="/settings" class="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors" active-class="!text-green-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        <span class="text-xs font-semibold tracking-wide">Settings</span>
      </router-link>
    </nav>
  </div>
</template>
