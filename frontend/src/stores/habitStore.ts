import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '../api/apiClient';

export const useHabitStore = defineStore('habit', () => {
  const saveDailyLog = async (exerciseId: string, _type: string, metrics: any) => {
    try {
      const payload = {
        exerciseId,
        date: new Date().toISOString(),
        metrics
      };
      
      const response = await apiClient.post('/logs', payload);
      console.log('Saved successfully:', response);
      // In a real offline-first app, we'd handle caching and queueing here if fetch fails.
      return true;
    } catch (error) {
      console.error('Failed to save daily log:', error);
      alert('Network error. Will sync later. (Optimistic UI would update here)');
      // Here you would push to a local offline queue
      return false;
    }
  };

  const userStats = ref({
    coins: 0,
    currentStreak: 0,
    streakFreezes: 0,
  });

  const history = ref<{ date: string; status: string }[]>([]);

  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get('/user/me');
      if (response && response.user) {
        userStats.value = {
          coins: response.user.coins,
          currentStreak: response.user.currentStreak,
          streakFreezes: response.user.streakFreezes,
        };
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchHistory = async (month: string) => {
    try {
      const response = await apiClient.get(`/logs/history?month=${month}`);
      if (response && response.history) {
        history.value = response.history;
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
  };

  const register = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/register', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    userStats.value = { coins: 0, currentStreak: 0, streakFreezes: 0 };
    history.value = [];
    window.location.href = '/login';
  };

  const buyFreeze = async () => {
    try {
      const response = await apiClient.post('/store/buy-freeze', {});
      if (response && response.user) {
        userStats.value.coins = response.user.coins;
        userStats.value.streakFreezes = response.user.streakFreezes;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to buy freeze:', error);
      alert('Could not purchase Streak Freeze. Check your coin balance.');
      return false;
    }
  };

  return {
    saveDailyLog,
    fetchUserStats,
    fetchHistory,
    buyFreeze,
    login,
    register,
    logout,
  };
});
