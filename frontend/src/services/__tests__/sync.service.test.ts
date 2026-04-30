import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncService } from '../sync.service';
import { apiService, ApiError } from '../api.service';
import { dbService } from '../db.service';

// Mock dependencies
vi.mock('../api.service', () => ({
  apiService: {
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(public message: string, public status: number) {
      super(message);
    }
  }
}));

vi.mock('../db.service', () => ({
  dbService: {
    enqueueSyncTask: vi.fn(),
    getAllSyncTasks: vi.fn(),
    deleteSyncTask: vi.fn(),
  },
}));

describe('sync.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  it('should call apiService when online and sync is successful', async () => {
    (apiService.put as any).mockResolvedValue({ success: true });

    await syncService.syncWithBackend('/test', 'PUT', { data: 123 });

    expect(apiService.put).toHaveBeenCalledWith('/test', { data: 123 });
    expect(dbService.enqueueSyncTask).not.toHaveBeenCalled();
  });

  it('should enqueue task when apiService fails with a network/server error', async () => {
    // Mock network error (no status) or 500
    (apiService.put as any).mockRejectedValue(new Error('Network error'));

    await syncService.syncWithBackend('/test', 'PUT', { data: 123 });

    expect(dbService.enqueueSyncTask).toHaveBeenCalled();
  });

  it('should drop task and NOT enqueue if it is a 4xx client error', async () => {
    (apiService.put as any).mockRejectedValue(new ApiError('Bad Request', 400));

    await syncService.syncWithBackend('/test', 'PUT', { data: 123 });

    expect(dbService.enqueueSyncTask).not.toHaveBeenCalled();
  });

  it('should process offline queue and delete tasks upon success', async () => {
    const mockTasks = [
      { id: '1', method: 'PUT', url: '/test1', payload: { a: 1 } },
      { id: '2', method: 'POST', url: '/test2', payload: { b: 2 } }
    ];

    (dbService.getAllSyncTasks as any).mockResolvedValue(mockTasks);
    (apiService.put as any).mockResolvedValue({});
    (apiService.post as any).mockResolvedValue({});

    await syncService.processOfflineQueue();

    expect(apiService.put).toHaveBeenCalledWith('/test1', { a: 1 });
    expect(apiService.post).toHaveBeenCalledWith('/test2', { b: 2 });
    expect(dbService.deleteSyncTask).toHaveBeenCalledTimes(2);
  });

  it('should stop processing and NOT delete task if a network error occurs during queue processing', async () => {
    const mockTasks = [
      { id: '1', method: 'PUT', url: '/test1', payload: { a: 1 } }
    ];

    (dbService.getAllSyncTasks as any).mockResolvedValue(mockTasks);
    (apiService.put as any).mockRejectedValue(new Error('Network error'));

    await syncService.processOfflineQueue();

    expect(apiService.put).toHaveBeenCalled();
    expect(dbService.deleteSyncTask).not.toHaveBeenCalled();
  });

  describe('fullSyncDown', () => {
    it('should fetch routine and logs and update dbService and return true if updated', async () => {
      const mockRoutine = { id: 'r1', updatedAt: '2023-01-01T00:00:00Z', exercises: [] };
      const mockLogs = { logs: [{ id: 'l1', logicalDate: '2023-01-01', lastUpdated: '2023-01-01T00:00:00Z' }] };

      (apiService.get as any) = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/routine')) return Promise.resolve(mockRoutine);
        if (url.includes('/logs')) return Promise.resolve(mockLogs);
        return Promise.reject(new Error('Unknown URL'));
      });

      (dbService.getRoutine as any) = vi.fn().mockResolvedValue(null);
      (dbService.getDailyLog as any) = vi.fn().mockResolvedValue(null);
      (dbService.putRoutine as any) = vi.fn().mockResolvedValue(undefined);
      (dbService.putDailyLog as any) = vi.fn().mockResolvedValue(undefined);

      const result = await syncService.fullSyncDown();

      expect(apiService.get).toHaveBeenCalledWith('/api/v1/routine');
      expect(apiService.get).toHaveBeenCalledWith(expect.stringContaining('/api/v1/logs'));
      expect(dbService.putRoutine).toHaveBeenCalledWith(mockRoutine);
      expect(dbService.putDailyLog).toHaveBeenCalledWith(mockLogs.logs[0]);
      expect(result).toEqual({ routineUpdated: true, logsUpdated: true });
    });

    it('should use 7-day range by default if recently synced', async () => {
      const mockLogs = { logs: [] };
      (apiService.get as any) = vi.fn().mockResolvedValue(mockLogs);
      
      // Simulate recent sync
      localStorage.setItem('lastFullSyncDown', (Date.now() - 1000).toString());

      await syncService.fullSyncDown();

      const logsCall = (apiService.get as any).mock.calls.find((call: any) => call[0].includes('/logs'));
      const url = logsCall[0];
      const startDateStr = url.split('startDate=')[1].split('&')[0];
      
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 7);
      const expectedStr = expectedDate.toISOString().split('T')[0];

      expect(startDateStr).toBe(expectedStr);
    });

    it('should use 90-day range if never synced before', async () => {
      localStorage.removeItem('lastFullSyncDown');
      const mockLogs = { logs: [] };
      (apiService.get as any) = vi.fn().mockResolvedValue(mockLogs);

      await syncService.fullSyncDown();

      const logsCall = (apiService.get as any).mock.calls.find((call: any) => call[0].includes('/logs'));
      const url = logsCall[0];
      const startDateStr = url.split('startDate=')[1].split('&')[0];
      
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 90);
      const expectedStr = expectedDate.toISOString().split('T')[0];

      expect(startDateStr).toBe(expectedStr);
    });

    it('should only update if backend data is newer (LWW)', async () => {
      const staleBackendRoutine = { id: 'r1', updatedAt: '2023-01-01T00:00:00Z', exercises: [] };
      const freshLocalRoutine = { id: 'r1', updatedAt: '2023-01-02T00:00:00Z', exercises: [] };

      (apiService.get as any) = vi.fn().mockResolvedValue(staleBackendRoutine);
      (dbService.getRoutine as any) = vi.fn().mockResolvedValue(freshLocalRoutine);
      (dbService.putRoutine as any) = vi.fn().mockResolvedValue(undefined);

      // We only test routine for brevity in this case
      // Need to mock logs call too to avoid error
      (apiService.get as any).mockImplementation((url: string) => {
        if (url.includes('/routine')) return Promise.resolve(staleBackendRoutine);
        if (url.includes('/logs')) return Promise.resolve({ logs: [] });
        return Promise.reject(new Error('Unknown URL'));
      });

      await syncService.fullSyncDown();

      expect(dbService.putRoutine).not.toHaveBeenCalled();
    });
  });
});
