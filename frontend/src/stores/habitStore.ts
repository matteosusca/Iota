import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '../api/apiClient';

export const useHabitStore = defineStore('habit', () => {
  const userId = '927d8b9b-d72b-4227-9fa3-4dd38cc50540'; // Hardcoded test user id
  
  const saveDailyLog = async (exerciseId: string, _type: string, metrics: any) => {
    try {
      const payload = {
        userId,
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

  return {
    userId,
    userStats,
    history,
    saveDailyLog,
    fetchUserStats,
    fetchHistory,
  };
});
