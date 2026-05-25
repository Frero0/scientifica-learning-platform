import type {
  Course,
  ExerciseLessonStep,
  LearningStatus,
  Lesson,
  Level,
  ProgressSummary
} from "./types";

export type LearningProgressInput = {
  completedCourseIds?: Iterable<string>;
  completedLevelIds?: Iterable<string>;
  completedLessonIds?: Iterable<string>;
  completedStepIds?: Iterable<string>;
  completedExerciseIds?: Iterable<string>;
  startedCourseIds?: Iterable<string>;
  startedLevelIds?: Iterable<string>;
  startedLessonIds?: Iterable<string>;
  startedStepIds?: Iterable<string>;
  attemptedExerciseIds?: Iterable<string>;
};

export type LessonUnlockInput = {
  completedLessonIds?: Iterable<string>;
  previousLesson?: Pick<Lesson, "id">;
};

export function calculateCompletionPercent(completedCount: number, totalCount: number): number {
  if (totalCount <= 0 || completedCount <= 0) {
    return 0;
  }

  const boundedCompleted = Math.min(completedCount, totalCount);
  return Math.round((boundedCompleted / totalCount) * 100);
}

export function isLessonUnlocked(
  lesson: Pick<Lesson, "id" | "prerequisites">,
  input: LessonUnlockInput = {}
): boolean {
  const completedLessonIds = toSet(input.completedLessonIds);

  if (completedLessonIds.has(lesson.id)) {
    return true;
  }

  if (lesson.prerequisites?.some((lessonId) => !completedLessonIds.has(lessonId))) {
    return false;
  }

  if (input.previousLesson && !completedLessonIds.has(input.previousLesson.id)) {
    return false;
  }

  return true;
}

export function calculateLessonStatus(
  lesson: Lesson,
  input: LearningProgressInput & { unlocked?: boolean } = {}
): LearningStatus {
  const completedLessonIds = toSet(input.completedLessonIds);

  if (completedLessonIds.has(lesson.id)) {
    return "completed";
  }

  const requiredExercises = getRequiredExerciseSteps(lesson);
  const completedExerciseIds = toSet(input.completedExerciseIds);
  const completedStepIds = toSet(input.completedStepIds);
  const completedRequiredCount = requiredExercises.filter(
    (step) => completedStepIds.has(step.id) || completedExerciseIds.has(step.exercise.id)
  ).length;

  if (requiredExercises.length > 0 && completedRequiredCount === requiredExercises.length) {
    return "completed";
  }

  if (input.unlocked === false) {
    return "locked";
  }

  if (hasLessonActivity(lesson, input)) {
    return "in_progress";
  }

  return "available";
}

export function calculateLessonProgressSummary(
  lesson: Lesson,
  input: LearningProgressInput & { unlocked?: boolean } = {}
): ProgressSummary {
  const requiredExercises = getRequiredExerciseSteps(lesson);
  const completedExerciseIds = toSet(input.completedExerciseIds);
  const completedStepIds = toSet(input.completedStepIds);
  const completedCount = requiredExercises.filter(
    (step) => completedStepIds.has(step.id) || completedExerciseIds.has(step.exercise.id)
  ).length;

  return {
    completedCount,
    totalCount: requiredExercises.length,
    percent: calculateCompletionPercent(completedCount, requiredExercises.length),
    status: calculateLessonStatus(lesson, input)
  };
}

export function calculateLevelStatus(
  level: Level,
  input: LearningProgressInput & { unlocked?: boolean } = {}
): LearningStatus {
  const completedLevelIds = toSet(input.completedLevelIds);

  if (completedLevelIds.has(level.id)) {
    return "completed";
  }

  const completedLessonIds = toSet(input.completedLessonIds);
  const completedLessonCount = level.lessons.filter((lesson) =>
    completedLessonIds.has(lesson.id)
  ).length;

  if (level.lessons.length > 0 && completedLessonCount === level.lessons.length) {
    return "completed";
  }

  if (input.unlocked === false) {
    return "locked";
  }

  if (hasLevelActivity(level, input)) {
    return "in_progress";
  }

  return "available";
}

export function calculateLevelProgressSummary(
  level: Level,
  input: LearningProgressInput & { unlocked?: boolean } = {}
): ProgressSummary {
  const completedLessonIds = toSet(input.completedLessonIds);
  const completedCount = level.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;

  return {
    completedCount,
    totalCount: level.lessons.length,
    percent: calculateCompletionPercent(completedCount, level.lessons.length),
    status: calculateLevelStatus(level, input)
  };
}

export function calculateCourseStatus(
  course: Course,
  input: LearningProgressInput & { unlocked?: boolean } = {}
): LearningStatus {
  const completedCourseIds = toSet(input.completedCourseIds);

  if (completedCourseIds.has(course.id)) {
    return "completed";
  }

  const completedLevelIds = toSet(input.completedLevelIds);
  const completedLevelCount = course.levels.filter(
    (level) => completedLevelIds.has(level.id) || isLevelCompletedFromLessons(level, input)
  ).length;

  if (course.levels.length > 0 && completedLevelCount === course.levels.length) {
    return "completed";
  }

  if (input.unlocked === false) {
    return "locked";
  }

  if (hasCourseActivity(course, input)) {
    return "in_progress";
  }

  return "available";
}

export function calculateCourseProgressSummary(
  course: Course,
  input: LearningProgressInput & { unlocked?: boolean } = {}
): ProgressSummary {
  const completedLevelIds = toSet(input.completedLevelIds);
  const completedCount = course.levels.filter(
    (level) => completedLevelIds.has(level.id) || isLevelCompletedFromLessons(level, input)
  ).length;

  return {
    completedCount,
    totalCount: course.levels.length,
    percent: calculateCompletionPercent(completedCount, course.levels.length),
    status: calculateCourseStatus(course, input)
  };
}

function getRequiredExerciseSteps(lesson: Lesson): ExerciseLessonStep[] {
  return lesson.steps.filter(
    (step): step is ExerciseLessonStep => step.type === "exercise" && step.required !== false
  );
}

function hasLessonActivity(lesson: Lesson, input: LearningProgressInput): boolean {
  const startedLessonIds = toSet(input.startedLessonIds);
  const startedStepIds = toSet(input.startedStepIds);
  const attemptedExerciseIds = toSet(input.attemptedExerciseIds);
  const completedStepIds = toSet(input.completedStepIds);
  const completedExerciseIds = toSet(input.completedExerciseIds);

  return (
    startedLessonIds.has(lesson.id) ||
    lesson.steps.some(
      (step) =>
        startedStepIds.has(step.id) ||
        completedStepIds.has(step.id) ||
        (step.type === "exercise" &&
          (attemptedExerciseIds.has(step.exercise.id) || completedExerciseIds.has(step.exercise.id)))
    )
  );
}

function hasLevelActivity(level: Level, input: LearningProgressInput): boolean {
  const startedLevelIds = toSet(input.startedLevelIds);
  const completedLessonIds = toSet(input.completedLessonIds);

  return (
    startedLevelIds.has(level.id) ||
    level.lessons.some(
      (lesson) => completedLessonIds.has(lesson.id) || hasLessonActivity(lesson, input)
    )
  );
}

function isLevelCompletedFromLessons(level: Level, input: LearningProgressInput): boolean {
  const completedLessonIds = toSet(input.completedLessonIds);

  return (
    level.lessons.length > 0 && level.lessons.every((lesson) => completedLessonIds.has(lesson.id))
  );
}

function hasCourseActivity(course: Course, input: LearningProgressInput): boolean {
  const startedCourseIds = toSet(input.startedCourseIds);
  const completedLevelIds = toSet(input.completedLevelIds);

  return (
    startedCourseIds.has(course.id) ||
    course.levels.some((level) => completedLevelIds.has(level.id) || hasLevelActivity(level, input))
  );
}

function toSet(values: Iterable<string> | undefined): Set<string> {
  return values instanceof Set ? values : new Set(values ?? []);
}
