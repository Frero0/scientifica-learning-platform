export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type UserProgress = {
  userId: string;
  courseId: string;
  lessonId?: string;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: ProgressStatus;
  updatedAt: Date;
};
