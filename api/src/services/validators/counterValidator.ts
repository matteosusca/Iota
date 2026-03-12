import { ExerciseValidatorStrategy } from './index';

export class CounterValidator implements ExerciseValidatorStrategy {
  validate(metrics: any): boolean {
    return metrics && typeof metrics.reps === 'number' && metrics.reps >= 0;
  }
  
  getErrorMessage(): string {
    return 'Invalid metrics for counter type. Expected { reps: number }.';
  }
}
