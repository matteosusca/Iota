import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface ExerciseDefinition {
  id: string;
  name: string;
  type: 'counter' | 'timer';
  target: number;
  order: number;
}

export interface UserRoutine {
  id: string;
  userId: string;
  updatedAt: string;
  exercises: ExerciseDefinition[];
}

interface ExerciseProgress {
  id: string;
  name: string;
  type: 'counter' | 'timer';
  target: number;
  progress: number;
}

export interface DailyLog {
  id: string; // "{userId}_{logicalDate}"
  userId: string;
  logicalDate: string;
  status: 'failed' | 'saved' | 'completed';
  completionPercentage: number;
  lastUpdated: string;
  exercisesSnapshot: ExerciseProgress[];
}

export interface SyncTask {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload: any;
  timestamp: string;
  retryCount: number;
  nextRetryAt?: number;
}

interface IotaDB extends DBSchema {
  routines: {
    key: string;
    value: UserRoutine;
  };
  daily_logs: {
    key: string;
    value: DailyLog;
  };
  sync_queue: {
    key: string;
    value: SyncTask;
  };
}

let dbPromise: Promise<IDBPDatabase<IotaDB>> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<IotaDB>('iota-db', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('routines')) {
          db.createObjectStore('routines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('daily_logs')) {
          db.createObjectStore('daily_logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const dbService = {
  async getRoutine(id: string): Promise<UserRoutine | undefined> {
    const db = await getDB();
    return db.get('routines', id);
  },
  
  async putRoutine(routine: UserRoutine): Promise<void> {
    const db = await getDB();
    await db.put('routines', routine);
  },

  async getDailyLog(id: string): Promise<DailyLog | undefined> {
    const db = await getDB();
    return db.get('daily_logs', id);
  },

  async getPastDays(userId: string, logicalDates: string[]): Promise<DailyLog[]> {
    const db = await getDB();
    const ids = logicalDates.map(date => `${userId}_${date}`);
    const logs = await Promise.all(ids.map(id => db.get('daily_logs', id)));
    return logs.filter((log): log is DailyLog => Boolean(log));
  },

  async putDailyLog(log: DailyLog): Promise<void> {
    const db = await getDB();
    await db.put('daily_logs', log);
  },

  async enqueueSyncTask(task: SyncTask): Promise<void> {
    const db = await getDB();
    await db.put('sync_queue', task);
  },
  
  async getAllSyncTasks(): Promise<SyncTask[]> {
    const db = await getDB();
    const tasks = await db.getAll('sync_queue');
    return tasks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async deleteSyncTask(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('sync_queue', id);
  },

  async clearAllData(): Promise<void> {
    const db = await getDB();
    await db.clear('routines');
    await db.clear('daily_logs');
    await db.clear('sync_queue');
  }
};
