export interface ExerciseDefinition {
  id: string;        // E.g., "ex_001"
  name: string;      // E.g., "Push-ups"
  type: 'counter' | 'timer';
  target: number;    // Count for 'counter', Seconds for 'timer'
  order: number;     // UI rendering order
}

export interface UserRoutine {
  id: string;        // "routine_{deviceId}"
  userId: string;
  updatedAt: string; // ISO 8601
  exercises: ExerciseDefinition[];
}

export interface ExerciseProgress {
  id: string;        // Matches ExerciseDefinition.id
  name: string;      // Snapshot of the name
  type: 'counter' | 'timer';
  target: number;    // Snapshot of the target
  progress: number;  // User's actual completion (Number of reps or Seconds)
}

export interface DailyLog {
  id: string;                   // Composite PK: "{userId}_{logicalDate}"
  userId: string;
  logicalDate: string;          // Format: "YYYY-MM-DD"
  status: 'failed' | 'saved' | 'completed';
  completionPercentage: number; // 0 to 100
  lastUpdated: string;          // ISO 8601
  exercisesSnapshot: ExerciseProgress[];
}
