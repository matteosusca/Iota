import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLogStore } from '../logStore';
import { dbService } from '../../services/db.service';
import { syncService } from '../../services/sync.service';

// Mock dependencies
vi.mock('../../services/db.service', () => ({
  dbService: {
    getDailyLog: vi.fn(),
    putDailyLog: vi.fn(),
  },
}));

vi.mock('../../services/sync.service', () => ({
  syncService: {
    syncWithBackend: vi.fn(),
  },
}));

describe('logStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should load a log and generate one if it does not exist', async () => {
    const store = useLogStore();
    const mockUserRoutine = {
      id: 'routine_1',
      userId: 'user_123',
      updatedAt: '2024-01-01T00:00:00Z',
      exercises: [
        { id: 'ex_1', name: 'Pushups', type: 'counter', target: 10, order: 1 }
      ]
    };

    (dbService.getDailyLog as any).mockResolvedValue(null);
    (dbService.putDailyLog as any).mockResolvedValue(undefined);

    const log = await store.loadTodayLog('user_123', mockUserRoutine as any);

    expect(log).toBeDefined();
    expect(log?.status).toBe('failed');
    expect(log?.exercisesSnapshot[0].name).toBe('Pushups');
    expect(dbService.putDailyLog).toHaveBeenCalled();
  });

  it('should update exercise progress and set status to failed if < 50%', async () => {
    const store = useLogStore();
    store.currentLog = {
      id: 'user_123_2024-03-15',
      userId: 'user_123',
      logicalDate: '2024-03-15',
      status: 'failed',
      completionPercentage: 0,
      lastUpdated: '2024-03-15T10:00:00Z',
      exercisesSnapshot: [
        { id: 'ex_1', name: 'Pushups', type: 'counter', target: 10, progress: 0 },
        { id: 'ex_2', name: 'Plank', type: 'timer', target: 60, progress: 0 }
      ]
    };

    // Update Pushups (+4 reps) -> 4/10 = 40% (avg with 0% of plank = 20%)
    await store.updateExerciseProgress('ex_1', 4);

    expect(store.currentLog.exercisesSnapshot[0].progress).toBe(4);
    expect(store.currentLog.completionPercentage).toBe(20);
    expect(store.currentLog.status).toBe('failed');
  });

  it('should set status to saved when >= 50% but < 100%', async () => {
    const store = useLogStore();
    store.currentLog = {
      id: 'user_123_2024-03-15',
      userId: 'user_123',
      logicalDate: '2024-03-15',
      status: 'failed',
      completionPercentage: 40,
      lastUpdated: '2024-03-15T10:00:00Z',
      exercisesSnapshot: [
        { id: 'ex_1', name: 'Pushups', type: 'counter', target: 10, progress: 4 }
      ]
    };

    // 5/10 = 50%
    await store.updateExerciseProgress('ex_1', 1);

    expect(store.currentLog.completionPercentage).toBe(50);
    expect(store.currentLog.status).toBe('saved');
  });

  it('should transition to completed status when 100% is reached', async () => {
    const store = useLogStore();
    store.currentLog = {
      id: 'user_123_2024-03-15',
      userId: 'user_123',
      logicalDate: '2024-03-15',
      status: 'saved',
      completionPercentage: 90,
      lastUpdated: '2024-03-15T10:00:00Z',
      exercisesSnapshot: [
        { id: 'ex_1', name: 'Pushups', type: 'counter', target: 10, progress: 9 }
      ]
    };

    await store.updateExerciseProgress('ex_1', 1);

    expect(store.currentLog.completionPercentage).toBe(100);
    expect(store.currentLog.status).toBe('completed');
  });

  it('should not allow progress to drop below zero', async () => {
    const store = useLogStore();
    store.currentLog = {
      id: 'user_123_2024-03-15',
      userId: 'user_123',
      logicalDate: '2024-03-15',
      status: 'saved',
      completionPercentage: 10,
      lastUpdated: '2024-03-15T10:00:00Z',
      exercisesSnapshot: [
        { id: 'ex_1', name: 'Pushups', type: 'counter', target: 10, progress: 1 }
      ]
    };

    await store.updateExerciseProgress('ex_1', -5);

    expect(store.currentLog.exercisesSnapshot[0].progress).toBe(0);
    expect(store.currentLog.completionPercentage).toBe(0);
  });
});
