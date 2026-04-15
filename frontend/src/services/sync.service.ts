import { dbService } from './db.service';
import type { SyncTask } from './db.service';
import { apiService, ApiError } from './api.service';

class SyncService {
  private isProcessing = false;

  async syncWithBackend(url: string, method: SyncTask['method'], payload: any): Promise<void> {
    try {
      if (method === 'PUT') {
        await apiService.put(url, payload);
      } else if (method === 'POST') {
        await apiService.post(url, payload);
      } else if (method === 'DELETE') {
        await apiService.delete(url);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        console.error('Client Error, dropping sync action:', error.message);
        return;
      }
      
      console.log('Network/Server error, placing sync action in offline queue.');
      const task: SyncTask = {
        id: crypto.randomUUID(),
        url,
        method,
        payload,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        nextRetryAt: Date.now()
      };
      await dbService.enqueueSyncTask(task);
    }
  }

  async processOfflineQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!navigator.onLine) return; // Browser thinks it's offline, skip

    this.isProcessing = true;
    try {
      const allTasks = await dbService.getAllSyncTasks();
      // Only process tasks that are ready for retry
      const tasks = allTasks.filter(t => !t.nextRetryAt || t.nextRetryAt <= Date.now());
      
      for (const task of tasks) {
        try {
          if (task.method === 'PUT') {
            await apiService.put(task.url, task.payload);
          } else if (task.method === 'POST') {
            await apiService.post(task.url, task.payload);
          } else if (task.method === 'DELETE') {
            await apiService.delete(task.url);
          }
          await dbService.deleteSyncTask(task.id);
        } catch (error) {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            console.error(`Dropping failed task ${task.id} due to 4xx code.`);
            await dbService.deleteSyncTask(task.id);
          } else {
            // Exponential backoff logic
            task.retryCount++;
            const delay = Math.min(1000 * Math.pow(2, task.retryCount), 60000); // Backoff up to 60s
            task.nextRetryAt = Date.now() + delay;
            
            console.warn(`Sync task ${task.id} failed (attempt ${task.retryCount}). Retrying in ${delay}ms.`);
            await dbService.enqueueSyncTask(task);
            
            // Halt queue processing for this cycle to wait for backoff
            break; 
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

export const syncService = new SyncService();
