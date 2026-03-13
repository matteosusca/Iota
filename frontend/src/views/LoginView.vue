<script setup lang="ts">
import { ref } from 'vue';
import { useHabitStore } from '../stores/habitStore';
import { useRouter } from 'vue-router';

const store = useHabitStore();
const router = useRouter();

const isLoginMode = ref(true);
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMsg.value = '';
};

const handleSubmit = async () => {
  errorMsg.value = '';
  if (!email.value || !password.value) {
    errorMsg.value = 'Email and password are required.';
    return;
  }
  
  isLoading.value = true;
  try {
    if (isLoginMode.value) {
      await store.login(email.value, password.value);
    } else {
      await store.register(email.value, password.value);
    }
    router.push({ name: 'dashboard' });
  } catch (error: any) {
    errorMsg.value = error.response?.data?.error || 'Authentication failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-green-100">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-4xl font-black tracking-tight text-gray-900">
        Kaizen<span class="text-green-600">Fit</span>
      </h1>
      <h2 class="mt-6 text-center text-xl font-bold text-gray-900">
        {{ isLoginMode ? 'Sign in to continue' : 'Create your account' }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
            <div class="mt-1">
              <input id="email" name="email" type="email" autocomplete="email" required v-model="email" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 transition-colors" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
            <div class="mt-1">
              <input id="password" name="password" type="password" autocomplete="current-password" required v-model="password" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 transition-colors" />
            </div>
          </div>
          
          <div v-if="errorMsg" class="text-red-500 text-sm font-medium text-center">
            {{ errorMsg }}
          </div>

          <div>
            <button type="submit" :disabled="isLoading" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50">
              <span v-if="isLoading">Loading...</span>
              <span v-else>{{ isLoginMode ? 'Sign in' : 'Sign up' }}</span>
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500"> Or </span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <button @click="toggleMode" type="button" class="text-sm font-medium text-green-600 hover:text-green-500 transition-colors">
              {{ isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Sign in' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
