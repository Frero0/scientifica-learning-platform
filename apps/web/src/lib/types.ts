import type { ExerciseType, LessonContent, ProgressStatus } from "@scientifica/domain";

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  moduleCount: number;
  lessonCount: number;
  exerciseCount: number;
};

export type CourseDetail = CourseSummary & {
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id: string;
      slug: string;
      title: string;
      summary: string;
      durationMinutes: number;
      order: number;
      exerciseCount: number;
    }>;
  }>;
};

export type PublicExercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  prompt: string;
  explanation?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  steps?: Array<{
    id: string;
    title: string;
    prompt: string;
    hint?: string;
  }>;
  visualization?: Record<string, unknown>;
  points: number;
  order: number;
};

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  order: number;
  module: {
    id: string;
    title: string;
  };
  course: {
    id: string;
    slug: string;
    title: string;
  };
  content: LessonContent;
  exercises: PublicExercise[];
};

export type ProgressItem = {
  id: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: ProgressStatus;
  updatedAt: string;
};

export type Achievement = {
  id: string;
  key: string;
  title: string;
  description: string;
  points: number;
  unlockedAt: string;
};

export type UserProgress = {
  userId: string;
  items: ProgressItem[];
  achievements: Achievement[];
};

export type SubmitAttemptResult = {
  attemptId: string;
  correct: boolean;
  score: number;
  feedback: string;
  expectedAnswer?: unknown;
  progress: ProgressItem;
};
