import type {
  CourseLevel,
  LearningExerciseType,
  LearningStatus,
  LessonStepType
} from "@scientifica/domain";

export type CourseSummaryDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: CourseLevel;
  estimatedMinutes: number;
  moduleCount: number;
  lessonCount: number;
  exerciseCount: number;
};

export type CourseLessonDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  order: number;
  exerciseCount: number;
};

export type CourseModuleDto = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLessonDto[];
};

export type CourseDetailDto = CourseSummaryDto & {
  modules: CourseModuleDto[];
};

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
