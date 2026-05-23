export const exerciseTypes = [
  "multiple_choice",
  "numeric_input",
  "drag_and_drop",
  "interactive_visualization",
  "step_by_step",
  "simulation"
] as const;

export type ExerciseType = (typeof exerciseTypes)[number];

export type ExerciseOption = {
  id: string;
  label: string;
  value: string;
};

export type ExerciseStep = {
  id: string;
  title: string;
  prompt: string;
  expectedAnswer?: unknown;
  hint?: string;
};

export type NumericAnswer = {
  value: number;
  tolerance?: number;
};

export type ExerciseAnswer = string | number | string[] | NumericAnswer | Record<string, unknown>;

export type Exercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  prompt: string;
  explanation?: string;
  options?: ExerciseOption[];
  steps?: ExerciseStep[];
  visualization?: Record<string, unknown>;
  correctAnswer: ExerciseAnswer;
  points: number;
  order: number;
};

export type ExerciseAttempt = {
  id: string;
  exerciseId: string;
  userId: string;
  submittedAnswer: unknown;
  correct: boolean;
  score: number;
  feedback: string;
  createdAt: Date;
};

export type ExerciseEvaluation = {
  correct: boolean;
  score: number;
  feedback: string;
  expectedAnswer?: ExerciseAnswer;
};
