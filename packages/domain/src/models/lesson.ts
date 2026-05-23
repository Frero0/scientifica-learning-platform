import type { Exercise } from "./exercise";

export type Lesson = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  summary: string;
  content: LessonContent;
  durationMinutes: number;
  order: number;
  exercises: Exercise[];
};

export type LessonContent = {
  introduction: string;
  keyIdeas: string[];
  visualExplanation: {
    title: string;
    description: string;
    variables: Array<{
      symbol: string;
      label: string;
    }>;
  };
};
