<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  exerciseId: string;
}>();

const emit = defineEmits<{
  (e: 'save', payload: { reps: number }): void;
}>();

const reps = ref(0);

const increment = () => reps.value++;
const decrement = () => {
  if (reps.value > 0) reps.value--;
};

const handleSave = () => {
  if (reps.value > 0) {
    emit('save', { reps: reps.value });
    reps.value = 0; // Reset after save
  }
};
</script>

<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <div class="flex items-center gap-6">
      <button @click="decrement" class="w-12 h-12 rounded-full bg-gray-100 text-gray-600 text-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center">-</button>
      <span class="text-4xl font-black w-20 text-center text-gray-800">{{ reps }}</span>
      <button @click="increment" class="w-12 h-12 rounded-full bg-green-100 text-green-700 text-xl font-bold hover:bg-green-200 transition-colors flex items-center justify-center">+</button>
    </div>
    <button @click="handleSave" class="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" :disabled="reps === 0">
      Log Reps
    </button>
  </div>
</template>
