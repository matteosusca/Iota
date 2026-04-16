# 🗄️ Iota - Data Models & API Contracts

## 1. Frontend Types (TypeScript / JSON)
These are the exact structures to be used in the Pinia stores and `IndexedDB`. Do NOT add undocumented fields.

### A. `UserRoutine` (The Active Blueprint)
There is only ONE active routine per user.
```typescript
interface ExerciseDefinition {
  id: string;        // E.g., "ex_001"
  name: string;      // E.g., "Push-ups"
  type: 'counter' | 'timer';
  target: number;    // Count for 'counter', Seconds for 'timer'
  order: number;     // UI rendering order
}

interface UserRoutine {
  id: string;        // "routine_{deviceId}"
  userId: string;
  updatedAt: string; // ISO 8601
  exercises: ExerciseDefinition[];
}
```

### B. `DailyLog` (The Immutable Snapshot)
Used as the Single Source of Truth for a specific Logical Day. 
```typescript
interface ExerciseProgress {
  id: string;        // Matches ExerciseDefinition.id
  name: string;      // Snapshot of the name
  type: 'counter' | 'timer';
  target: number;    // Snapshot of the target
  progress: number;  // User's actual completion (Number of reps or Seconds)
}

interface DailyLog {
  id: string;                   // Composite PK: "{userId}_{logicalDate}"
  userId: string;
  logicalDate: string;          // Format: "YYYY-MM-DD" (Calculated relative to 04:00 AM)
  status: 'failed' | 'saved' | 'completed'; // Pre-calculated by backend/services
  completionPercentage: number; // 0 to 100. Calculated using Total Volume.
  lastUpdated: string;          // ISO 8601
  exercisesSnapshot: ExerciseProgress[];
}
```

## 2. Backend Relational Schema (PostgreSQL)
* **`users`**: `id` (UUID), `created_at` (Timestamp), `push_subscription` (JSONB), `streak_count` (Int).
* **`routines`**: `id` (UUID), `user_id` (FK), `exercises` (JSONB).
* **`daily_logs`**: `id` (String PK), `user_id` (FK), `logical_date` (Date), `status` (String), `completion_percentage` (Int), `exercises_snapshot` (JSONB).

## 3. REST API Contracts (v1)
All calls require header: `Authorization: Bearer <JWT>` (Except `/auth/anonymous`).

* **`POST /api/v1/auth/anonymous`**
    * Req: `{ "deviceId": "uuid" }`
    * Res: `{ "token": "jwt...", "user": {...} }`
* **`GET /api/v1/routine`** -> Res: `UserRoutine`
* **`PUT /api/v1/routine`** -> Req: `UserRoutine` -> Res: `{ "success": true }`
* **`GET /api/v1/logs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`** -> Res: `{ "logs": DailyLog[] }`
* **`PUT /api/v1/logs/:logicalDate`** (Upsert logic)
    * Req: `DailyLog`
    * Res: `{ "success": true }`
* **`POST /api/v1/notifications/subscribe`**
    * Req: `{ "subscription": PushSubscriptionObject }`