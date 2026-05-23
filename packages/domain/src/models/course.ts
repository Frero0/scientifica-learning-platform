import type { Lesson } from "./lesson";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: CourseLevel;
  estimatedMinutes: number;
  modules: LearningModule[];
};

export type LearningModule = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
};
