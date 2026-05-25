import type {
  CourseLevel,
  ExerciseType,
  LearningExerciseType,
  LearningStatus,
  LessonStepType
} from "@scientifica/domain";

export type CoursePathProgressDto = {
  completedCount: number;
  totalCount: number;
  percent: number;
  status: LearningStatus;
};

export type CoursePathExerciseOptionDto = {
  id: string;
  label: string;
  value: string;
};

export type CoursePathExerciseStepDto = {
  id: string;
  prompt: string;
  hint?: string;
};

export type CoursePathExerciseDto = {
  id: string;
  type: LearningExerciseType;
  prompt: string;
  options?: CoursePathExerciseOptionDto[];
  steps?: CoursePathExerciseStepDto[];
  unit?: string;
  points: number;
  explanation?: string;
};

export type CoursePathContentStepDto = {
  id: string;
  lessonId: string;
  type: Exclude<LessonStepType, "exercise">;
  title?: string;
  order: number;
  required: boolean;
  body?: string;
  metadata?: Record<string, unknown>;
  progress: CoursePathProgressDto;
};

export type CoursePathExerciseStepItemDto = {
  id: string;
  lessonId: string;
  type: "exercise";
  title?: string;
  order: number;
  required: boolean;
  exercise: CoursePathExerciseDto;
  progress: CoursePathProgressDto;
};

export type CoursePathStepDto = CoursePathContentStepDto | CoursePathExerciseStepItemDto;

export type CoursePathLessonDto = {
  id: string;
  levelId: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  order: number;
  progress: CoursePathProgressDto;
  stepCount: number;
  requiredExerciseCount: number;
  steps: CoursePathStepDto[];
};

export type CoursePathLevelDto = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  progress: CoursePathProgressDto;
  lessons: CoursePathLessonDto[];
};

export type CoursePathSubjectDto = {
  id: string;
  slug: string;
  title: string;
};

export type CoursePathDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  difficulty: CourseLevel;
  estimatedMinutes: number;
  subject?: CoursePathSubjectDto;
  progress: CoursePathProgressDto;
  levels: CoursePathLevelDto[];
};

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

export type LessonPlayerExerciseBaseDto = {
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
