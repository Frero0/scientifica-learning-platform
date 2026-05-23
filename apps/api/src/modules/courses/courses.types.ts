import type { CourseLevel } from "@scientifica/domain";

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
