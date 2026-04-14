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
});
