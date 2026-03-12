import { defineStore } from 'pinia';
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

  return {
    userId,
    saveDailyLog
  };
});
