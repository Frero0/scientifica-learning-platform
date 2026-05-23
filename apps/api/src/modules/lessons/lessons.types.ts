import type { LessonContent } from "@scientifica/domain";

import type { PublicExerciseDto } from "../exercises/exercise.mapper";

export type LessonDetailDto = {
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
  exercises: PublicExerciseDto[];
};
