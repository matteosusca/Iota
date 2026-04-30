import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '../services/api.service';
import { syncService } from '../services/sync.service';

export const useAuthStore = defineStore('auth', () => {
  const deviceId = ref<string>('');
  const jwt = ref<string>('');
  const isAuthenticated = ref<boolean>(false);
  const isInitialized = ref<boolean>(false);
  const streakCount = ref<number>(parseInt(localStorage.getItem('streakCount') || '0', 10));

  function setStreakCount(count: number) {
    streakCount.value = count;
    localStorage.setItem('streakCount', count.toString());
  }

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
        if (response.user?.streakCount !== undefined) {
          setStreakCount(response.user.streakCount);
        }
      } catch (error) {
        console.error('Failed to initialize anonymous auth:', error);
      }
    }

    if (storedJwt) {
      jwt.value = storedJwt;
      isAuthenticated.value = true;
      
      // Pull latest data from backend as part of initialization
      // This ensures manual DB updates are picked up before router guards check for routines.
      await syncService.fullSyncDown();
      await fetchProfile();
    }

    isInitialized.value = true;
  }

  async function fetchProfile() {
    if (!isAuthenticated.value) return;
    try {
      const user = await apiService.get<{ streakCount: number }>('/api/v1/auth/me');
      if (user && user.streakCount !== undefined) {
        setStreakCount(user.streakCount);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }

  return { deviceId, jwt, isAuthenticated, isInitialized, initAuth, streakCount, setStreakCount, fetchProfile };
});
