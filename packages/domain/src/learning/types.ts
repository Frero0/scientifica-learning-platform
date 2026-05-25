export const learningStatuses = ["locked", "available", "in_progress", "completed"] as const;

export type LearningStatus = (typeof learningStatuses)[number];

export const lessonStepTypes = [
  "intro",
  "concept",
  "visual_model",
  "exercise",
  "reflection",
  "summary",
  "completion"
] as const;

export type LessonStepType = (typeof lessonStepTypes)[number];

export type StepType = LessonStepType;

export const learningExerciseTypes = ["multiple_choice", "numeric_input", "step_by_step"] as const;

export type LearningExerciseType = (typeof learningExerciseTypes)[number];

export type LearningMetadata = Record<string, unknown>;

export type Subject = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  courses?: Course[];
};

export type Course = {
  id: string;
  subjectId?: string;
  slug: string;
  title: string;
  summary: string;
  description?: string;
  estimatedMinutes?: number;
  order: number;
  prerequisites?: string[];
  levels: Level[];
};

export type Level = {
  id: string;
  courseId: string;
  slug?: string;
  title: string;
  summary?: string;
  description?: string;
  order: number;
  prerequisites?: string[];
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  levelId: string;
  slug: string;
  title: string;
  summary?: string;
  durationMinutes?: number;
  order: number;
  prerequisites?: string[];
  steps: LessonStep[];
};

export type BaseLessonStep = {
  id: string;
  lessonId?: string;
  type: LessonStepType;
  title?: string;
  order: number;
  required?: boolean;
  metadata?: LearningMetadata;
};

export type ContentLessonStep = BaseLessonStep & {
  type: Exclude<LessonStepType, "exercise">;
  body?: string;
};

export type ExerciseLessonStep = BaseLessonStep & {
  type: "exercise";
  exercise: LearningExercise;
};

export type LessonStep = ContentLessonStep | ExerciseLessonStep;

export type Step = LessonStep;

export type ExerciseOption = {
  id: string;
  label: string;
  value: string;
};

export type MultipleChoiceExercise = {
  id: string;
  type: "multiple_choice";
  prompt: string;
  options: ExerciseOption[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
};

export type NumericInputAnswer = {
  value: number;
  tolerance?: number;
};

export type NumericInputExercise = {
  id: string;
  type: "numeric_input";
  prompt: string;
  correctAnswer: number | NumericInputAnswer;
  points: number;
  explanation?: string;
  unit?: string;
};

export type StepByStepExerciseStep = {
  id: string;
  prompt: string;
  expectedAnswer?: unknown;
  hint?: string;
};

export type StepByStepExercise = {
  id: string;
  type: "step_by_step";
  prompt: string;
  steps: StepByStepExerciseStep[];
  points: number;
  explanation?: string;
};

export type LearningExercise =
  | MultipleChoiceExercise
  | NumericInputExercise
  | StepByStepExercise;

export type Attempt = {
  id?: string;
  lessonId: string;
  stepId?: string;
  exerciseId: string;
  submittedAnswer: unknown;
  result: EvaluationResult;
  createdAt?: Date;
};

export type EvaluationResult = {
  correct: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  expectedAnswer?: unknown;
};

export type ProgressSummary = {
  completedCount: number;
  totalCount: number;
  percent: number;
  status: LearningStatus;
};
