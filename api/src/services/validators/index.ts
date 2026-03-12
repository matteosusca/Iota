export interface ExerciseValidatorStrategy {
  validate(metrics: any): boolean;
  getErrorMessage(): string;
}

export const validatorRegistry: Record<string, ExerciseValidatorStrategy> = {};
