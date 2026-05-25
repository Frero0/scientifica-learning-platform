import type { ExerciseType, LearningStatus, LessonStepType } from "@scientifica/domain";

export type LessonPlayerProgressDto = {
  completed: boolean;
  currentStepId?: string;
  completedStepIds: string[];
  completedCount: number;
  totalCount: number;
  percent: number;
  status: LearningStatus;
  exercises: LessonPlayerExerciseStateDto[];
};

export type LessonPlayerExerciseStateDto = {
  exerciseId: string;
  stepId: string;
  status: "not_started" | "attempted" | "completed";
  attempted: boolean;
  completed: boolean;
  result?: "success" | "failure";
};

export type LessonPlayerStepProgressDto = {
  status: LearningStatus;
  locked: boolean;
  current: boolean;
  completed: boolean;
};

export type LessonPlayerHintDto = {
  id?: string;
  body: string;
};

export type LessonPlayerContentKindDto = Exclude<LessonStepType, "exercise">;

export type LessonPlayerContentDto = {
  kind: LessonPlayerContentKindDto;
  body?: string;
  keyIdeas?: string[];
  visual?: {
    title?: string;
    description?: string;
    variables: Array<Record<string, unknown>>;
  };
  hints?: LessonPlayerHintDto[];
  metadata?: Record<string, unknown>;
};

export type LessonPlayerExerciseOptionDto = {
  id: string;
  label: string;
  value: string;
};

export type LessonPlayerNestedExerciseStepDto = {
  id: string;
  title?: string;
  prompt: string;
  hint?: string;
};

type LessonPlayerExerciseBaseDto = {
  id: string;
  exerciseType: ExerciseType;
  prompt: string;
  points: number;
  explanation?: string;
  hints?: LessonPlayerHintDto[];
};

export type LessonPlayerQuizDto = LessonPlayerExerciseBaseDto & {
  exerciseType: "multiple_choice";
  options: LessonPlayerExerciseOptionDto[];
};

export type LessonPlayerNumericExerciseDto = LessonPlayerExerciseBaseDto & {
  exerciseType: "numeric_input";
  unit?: string;
};

export type LessonPlayerStepByStepExerciseDto = LessonPlayerExerciseBaseDto & {
  exerciseType: "step_by_step";
  steps: LessonPlayerNestedExerciseStepDto[];
};

export type LessonPlayerInteractiveDto = LessonPlayerExerciseBaseDto & {
  exerciseType: "drag_and_drop" | "interactive_visualization" | "simulation";
  options?: LessonPlayerExerciseOptionDto[];
  visualization?: Record<string, unknown>;
};

export type LessonPlayerExerciseDto =
  | LessonPlayerNumericExerciseDto
  | LessonPlayerStepByStepExerciseDto;

export type LessonPlayerBaseStepDto = {
  id: string;
  lessonId: string;
  type: "content" | "quiz" | "exercise" | "interactive";
  title?: string;
  order: number;
  required: boolean;
  progress: LessonPlayerStepProgressDto;
};

export type LessonPlayerContentStepDto = LessonPlayerBaseStepDto & {
  type: "content";
  content: LessonPlayerContentDto;
};

export type LessonPlayerQuizStepDto = LessonPlayerBaseStepDto & {
  type: "quiz";
  quiz: LessonPlayerQuizDto;
};

export type LessonPlayerExerciseStepDto = LessonPlayerBaseStepDto & {
  type: "exercise";
  exercise: LessonPlayerExerciseDto;
};

export type LessonPlayerInteractiveStepDto = LessonPlayerBaseStepDto & {
  type: "interactive";
  interactive: LessonPlayerInteractiveDto;
};

export type LessonPlayerStepDto =
  | LessonPlayerContentStepDto
  | LessonPlayerQuizStepDto
  | LessonPlayerExerciseStepDto
  | LessonPlayerInteractiveStepDto;

export type LessonPlayerDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  order: number;
  course: {
    id: string;
    slug: string;
    title: string;
  };
  level: {
    id: string;
    title: string;
    order: number;
  };
  progress: LessonPlayerProgressDto;
  steps: LessonPlayerStepDto[];
};
