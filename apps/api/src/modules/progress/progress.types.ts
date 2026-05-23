import type { ProgressStatus } from "@scientifica/domain";

import type { AchievementDto } from "../gamification/gamification.types";

export type ProgressItemDto = {
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

export type UserProgressDto = {
  userId: string;
  items: ProgressItemDto[];
  achievements: AchievementDto[];
};

export type RecordExerciseProgressInput = {
  userId: string;
  courseId: string;
  lessonId: string;
  exerciseId: string;
  correct: boolean;
};
