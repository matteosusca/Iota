import { PrismaClient } from '@prisma/client';
import { validatorRegistry } from './validators';
import { CounterValidator } from './validators/counterValidator';
import { TimerValidator } from './validators/timerValidator';

const prisma = new PrismaClient();

// Register available strategies (Open/Closed Principle)
validatorRegistry['counter'] = new CounterValidator();
validatorRegistry['timer'] = new TimerValidator();

export class DailyLogService {
  /**
   * Creates a new DailyLog. Uses Strategy Pattern to validate metrics.
   */
  static async createLog(userId: string, exerciseId: string, dateStr: string, metrics: any) {
    // 1. Fetch the exercise and user to ensure they exist, and get the exercise 'type'
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) {
      throw new Error(`Exercise not found with ID: ${exerciseId}`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // 2. Lookup the appropriate validation strategy based on exercise TYPE
    const validatorStrategy = validatorRegistry[exercise.type];
    if (!validatorStrategy) {
      throw new Error(`No validation strategy registered for exercise type: ${exercise.type}`);
    }

    // 3. Validate the generic JSONB metrics using the selected strategy
    const isValid = validatorStrategy.validate(metrics);
    if (!isValid) {
      throw new Error(validatorStrategy.getErrorMessage());
    }

    // 4. Calculate status. For now, we will mark as 'completed' by default
    // In the future, this is where we would check `metrics` vs `RoutineExercise.targetMetrics`
    const status = 'completed'; 
    const logDate = new Date(dateStr);

    // 5. Save the valid record natively using Prisma's JSON mapping
    const savedLog = await prisma.dailyLog.create({
      data: {
        userId,
        exerciseId,
        date: logDate,
        status,
        metrics, // Stored safely in the JSONB column
      },
    });

    return savedLog;
  }

  /**
   * Fetches the completion history for a given month.
   */
  static async getHistory(userId: string, targetMonth: string) {
    const [year, month] = targetMonth.split('-');
    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const endDate = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999));

    const routine = await prisma.routineExercise.findMany({ where: { userId } });
    const logs = await prisma.dailyLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' }
    });

    const history = [];
    const daysInMonth = endDate.getUTCDate();
    
    // Group logs by day
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month}-${String(d).padStart(2, '0')}`;
      
      const dayLogs = logs.filter(l => 
        l.date.getUTCFullYear() === Number(year) &&
        l.date.getUTCMonth() === Number(month) - 1 &&
        l.date.getUTCDate() === d
      );

      // Using simplified evaluation logic
      if (dayLogs.length === 0) {
        history.push({ date: dateStr, status: 'Failed' });
        continue;
      }

      // We only count unique exercises completed a day just in case there are multiple logs for the same exercise
      const uniqueCompletedCount = new Set(dayLogs.map(l => l.exerciseId)).size;
      const completionRatio = routine.length > 0 ? uniqueCompletedCount / routine.length : 0;
      
      let dayResult = 'Failed';
      if (completionRatio >= 1) {
        dayResult = 'Perfect';
      } else if (completionRatio >= 0.3) {
        dayResult = 'Saved';
      }

      // Note: "Frozen" would be checked by looking at streak Freezes history, but for MVP we simplify.
      history.push({ date: dateStr, status: dayResult });
    }

    return history;
  }
}
