<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  message?: string;
}>();

const messages = [
  "Don't break the chain",
  "Preparing your streak",
  "Focusing your goals",
  "Breathe in... Breathe out",
  "Almost there"
];

const displayMessage = ref(props.message || messages[0]);

onMounted(() => {
  if (!props.message) {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      displayMessage.value = messages[i];
    }, 2500);
    return () => clearInterval(interval);
  }
});
</script>

<template>
  <div class="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100]">
    <div class="relative w-32 h-32 mb-12">
      <!-- Subtle Ambient Glow -->
      <div class="absolute inset-2 bg-green-500/5 blur-3xl rounded-full"></div>
      
      <!-- The Spinner -->
      <div class="w-full h-full animate-spin-slow">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <defs>
            <!-- Muted gradient for the tail -->
            <linearGradient id="streakTail" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
            </linearGradient>
          </defs>
          
          <!-- Sturdier Track -->
          <circle cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="3" 
                  class="text-slate-900" />
          
          <!-- The Fading Tail - Bolder for mobile visibility -->
          <path d="M 10 50 A 40 40 0 0 1 50 10"
                fill="none"
                stroke="url(#streakTail)"
                stroke-width="4.5"
                stroke-linecap="round"
                transform="rotate(90 50 50)" />

          <!-- The Leading Head (The Iota Dot) - Optimized for visibility -->
          <g transform="translate(90, 50)">
            <circle r="6.5" fill="#22c55e" />
            <circle r="2.5" fill="white" />
            <!-- Subtle aura for presence -->
            <circle r="10" fill="#22c55e" fill-opacity="0.1" />
          </g>
        </svg>
      </div>
    </div>
    
    <!-- Status Text -->
    <div class="h-16 flex flex-col items-center justify-start gap-6">
      <Transition name="slide-fade" mode="out-in">
        <p :key="displayMessage" class="text-slate-400 font-semibold tracking-[0.2em] uppercase text-[11px] sm:text-xs text-center px-8 leading-relaxed">
          {{ displayMessage }}
        </p>
      </Transition>
      
      <!-- Visible Loading Line -->
      <div class="w-36 h-[1.5px] bg-slate-900 overflow-hidden relative rounded-full">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent animate-shimmer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 1.4s cubic-bezier(0.4, 0.15, 0.3, 0.85) infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-shimmer {
  animation: shimmer 2.5s infinite linear;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
