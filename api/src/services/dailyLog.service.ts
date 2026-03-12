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
}
