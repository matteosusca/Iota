import { ExerciseValidatorStrategy } from './index';

export class TimerValidator implements ExerciseValidatorStrategy {
  validate(metrics: any): boolean {
    return metrics && typeof metrics.seconds_elapsed === 'number' && metrics.seconds_elapsed >= 0;
  }
  
  getErrorMessage(): string {
    return 'Invalid metrics for timer type. Expected { seconds_elapsed: number }.';
  }
}
