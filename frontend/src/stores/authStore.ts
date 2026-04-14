import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api.service';

export const useAuthStore = defineStore('auth', () => {
  const deviceId = ref<string>('');
  const jwt = ref<string>('');
  const isAuthenticated = ref<boolean>(false);
  const isInitialized = ref<boolean>(false);

  async function initAuth() {
    if (isInitialized.value) return;

    let storedDeviceId = localStorage.getItem('deviceId');
    let storedJwt = localStorage.getItem('jwt');

    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    
    deviceId.value = storedDeviceId;

    if (!storedJwt) {
      try {
        const response = await apiService.post<{ token: string, user: any }>('/api/v1/auth/anonymous', {
          deviceId: deviceId.value
        });
        
        storedJwt = response.token;
        localStorage.setItem('jwt', storedJwt);
      } catch (error) {
        console.error('Failed to initialize anonymous auth:', error);
      }
    }

    if (storedJwt) {
      jwt.value = storedJwt;
      isAuthenticated.value = true;
    }

    isInitialized.value = true;
  }

  return { deviceId, jwt, isAuthenticated, isInitialized, initAuth };
});
