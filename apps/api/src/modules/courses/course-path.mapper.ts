import {
  calculateCompletionPercent,
  type CourseLevel,
  type LearningExerciseType,
  type LearningStatus,
  type LessonStepType
} from "@scientifica/domain";

import type {
  CoursePathDto,
  CoursePathExerciseDto,
  CoursePathExerciseOptionDto,
  CoursePathExerciseStepDto,
  CoursePathProgressDto,
  CoursePathStepDto
} from "./courses.types";

const contentStepTypes = [
  "intro",
  "concept",
  "visual_model",
  "reflection",
  "summary",
  "completion"
] as const satisfies ReadonlyArray<Exclude<LessonStepType, "exercise">>;

const exerciseTypeMap: Record<string, LearningExerciseType | undefined> = {
  MULTIPLE_CHOICE: "multiple_choice",
  NUMERIC_INPUT: "numeric_input",
  STEP_BY_STEP: "step_by_step",
  multiple_choice: "multiple_choice",
  numeric_input: "numeric_input",
  step_by_step: "step_by_step"
};

export type CoursePathMapperCourse = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  difficulty: CourseLevel;
  estimatedMinutes: number;
  subject?: {
    id: string;
    slug: string;
    title: string;
  };
  modules: CoursePathMapperLevel[];
};

export type CoursePathMapperLevel = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: CoursePathMapperLesson[];
};

export type CoursePathMapperLesson = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  summary: string;
  content: unknown;
  durationMinutes: number;
  order: number;
  exercises: CoursePathMapperExercise[];
};

export type CoursePathMapperExercise = {
  id: string;
  lessonId: string;
  type: string;
  prompt: string;
  explanation?: string | null;
  options?: unknown;
  steps?: unknown;
  points: number;
  order: number;
};

export type CoursePathMapperProgressInput = {
  lessonProgress?: CoursePathMapperLessonProgress[];
  completedExerciseIds?: Iterable<string>;
  attemptedExerciseIds?: Iterable<string>;
};

export type CoursePathMapperLessonProgress = {
  lessonId: string | null;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: string;
};

type BuiltLesson = {
  lesson: CoursePathMapperLesson;
  steps: CoursePathStepDto[];
  requiredExerciseCount: number;
};

type CoursePathExerciseStep = Extract<CoursePathStepDto, { type: "exercise" }>;

type LessonProgressState = {
  progress: CoursePathProgressDto;
  completed: boolean;
  started: boolean;
  unlocked: boolean;
};

export function mapCourseToCoursePathDto(
  course: CoursePathMapperCourse,
  progressInput: CoursePathMapperProgressInput = {}
): CoursePathDto {
  const completedExerciseIds = toSet(progressInput.completedExerciseIds);
  const attemptedExerciseIds = toSet(progressInput.attemptedExerciseIds);
  const lessonProgressByLessonId = new Map(
    (progressInput.lessonProgress ?? [])
      .filter((item): item is CoursePathMapperLessonProgress & { lessonId: string } =>
        Boolean(item.lessonId)
      )
      .map((item) => [item.lessonId, item])
  );

  const builtLevels = course.modules
    .map((level) => ({
      ...level,
      lessons: level.lessons
        .map((lesson) => buildLesson(lesson, completedExerciseIds, attemptedExerciseIds))
        .sort((left, right) => left.lesson.order - right.lesson.order)
    }))
    .sort((left, right) => left.order - right.order);

  const completedLessonIds = new Set<string>();
  const startedLessonIds = new Set<string>();

  for (const level of builtLevels) {
    for (const builtLesson of level.lessons) {
      const progress = lessonProgressByLessonId.get(builtLesson.lesson.id);
      const completedByProgress = isCompletedStatus(progress?.status);
      const startedByProgress = progress !== undefined && !isNotStartedStatus(progress.status);
      const completedByExercises =
        builtLesson.requiredExerciseCount > 0 &&
        builtLesson.steps.filter(
          (step): step is CoursePathExerciseStep =>
            isRequiredExerciseStep(step) && completedExerciseIds.has(step.exercise.id)
        ).length >= builtLesson.requiredExerciseCount;

      if (completedByProgress || completedByExercises) {
        completedLessonIds.add(builtLesson.lesson.id);
      }

      if (
        startedByProgress ||
        builtLesson.steps.some(
          (step) =>
            step.type === "exercise" &&
            (attemptedExerciseIds.has(step.exercise.id) || completedExerciseIds.has(step.exercise.id))
        )
      ) {
        startedLessonIds.add(builtLesson.lesson.id);
      }
    }
  }

  const levelCompletion = new Map<string, boolean>();
  const levelDtos = builtLevels.map((level, levelIndex) => {
    const previousLevel = levelIndex > 0 ? builtLevels[levelIndex - 1] : undefined;
    const previousLevelCompleted =
      previousLevel === undefined ? true : (levelCompletion.get(previousLevel.id) ?? false);
    const unlocked = previousLevelCompleted;

    let previousLessonCompleted = true;
    const lessonDtos = level.lessons.map((builtLesson) => {
      const lessonProgress = lessonProgressByLessonId.get(builtLesson.lesson.id);
      const hasLessonActivity =
        completedLessonIds.has(builtLesson.lesson.id) || startedLessonIds.has(builtLesson.lesson.id);
      const lessonUnlocked = unlocked && (previousLessonCompleted || hasLessonActivity);
      const lessonState = buildLessonProgressState({
        builtLesson,
        lessonProgress,
        completedExerciseIds,
        attemptedExerciseIds,
        completedLessonIds,
        startedLessonIds,
        unlocked: lessonUnlocked
      });

      previousLessonCompleted = lessonState.completed;

      const steps = builtLesson.steps.map((step) =>
        attachStepProgress(step, lessonState, completedExerciseIds, attemptedExerciseIds)
      );

      return {
        id: builtLesson.lesson.id,
        levelId: builtLesson.lesson.moduleId,
        slug: builtLesson.lesson.slug,
        title: builtLesson.lesson.title,
        summary: builtLesson.lesson.summary,
        durationMinutes: builtLesson.lesson.durationMinutes,
        order: builtLesson.lesson.order,
        progress: lessonState.progress,
        stepCount: steps.length,
        requiredExerciseCount: builtLesson.requiredExerciseCount,
        steps
      };
    });

    const completedLessons = lessonDtos.filter((lesson) => lesson.progress.status === "completed")
      .length;
    const levelCompleted = lessonDtos.length > 0 && completedLessons === lessonDtos.length;
    levelCompletion.set(level.id, levelCompleted);

    const levelStatus = getAggregateStatus({
      completed: levelCompleted,
      started: lessonDtos.some((lesson) => isStartedStatus(lesson.progress.status)),
      unlocked
    });

    return {
      id: level.id,
      courseId: level.courseId,
      title: level.title,
      description: level.description,
      order: level.order,
      progress: {
        completedCount: completedLessons,
        totalCount: lessonDtos.length,
        percent: calculateCompletionPercent(completedLessons, lessonDtos.length),
        status: levelStatus
      },
      lessons: lessonDtos
    };
  });

  const completedLevels = levelDtos.filter((level) => level.progress.status === "completed").length;
  const courseStatus = getAggregateStatus({
    completed: levelDtos.length > 0 && completedLevels === levelDtos.length,
    started: levelDtos.some((level) => isStartedStatus(level.progress.status)),
    unlocked: true
  });

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    difficulty: course.difficulty,
    estimatedMinutes: course.estimatedMinutes,
    ...(course.subject ? { subject: course.subject } : {}),
    progress: {
      completedCount: completedLevels,
      totalCount: levelDtos.length,
      percent: calculateCompletionPercent(completedLevels, levelDtos.length),
      status: courseStatus
    },
    levels: levelDtos
  };
}

function buildLesson(
  lesson: CoursePathMapperLesson,
  completedExerciseIds: ReadonlySet<string>,
  attemptedExerciseIds: ReadonlySet<string>
): BuiltLesson {
  const steps = buildSteps(lesson).map((step) =>
    attachStepProgress(
      step,
      {
        progress: zeroProgress("available"),
        completed: false,
        started: false,
        unlocked: true
      },
      completedExerciseIds,
      attemptedExerciseIds
    )
  );

  return {
    lesson,
    steps,
    requiredExerciseCount: steps.filter(isRequiredExerciseStep).length
  };
}

function buildLessonProgressState(input: {
  builtLesson: BuiltLesson;
  lessonProgress: CoursePathMapperLessonProgress | undefined;
  completedExerciseIds: ReadonlySet<string>;
  attemptedExerciseIds: ReadonlySet<string>;
  completedLessonIds: ReadonlySet<string>;
  startedLessonIds: ReadonlySet<string>;
  unlocked: boolean;
}): LessonProgressState {
  const requiredExercises = input.builtLesson.steps.filter(isRequiredExerciseStep);
  const completedRequiredExercises = requiredExercises.filter((step) =>
    input.completedExerciseIds.has(step.exercise.id)
  ).length;
  const completed =
    input.completedLessonIds.has(input.builtLesson.lesson.id) ||
    (requiredExercises.length > 0 && completedRequiredExercises >= requiredExercises.length);
  const started =
    input.startedLessonIds.has(input.builtLesson.lesson.id) ||
    requiredExercises.some(
      (step) =>
        input.attemptedExerciseIds.has(step.exercise.id) ||
        input.completedExerciseIds.has(step.exercise.id)
    );
  const status = getAggregateStatus({
    completed,
    started,
    unlocked: input.unlocked
  });

  if (input.lessonProgress) {
    const totalCount =
      input.lessonProgress.totalExercises > 0
        ? input.lessonProgress.totalExercises
        : requiredExercises.length;
    const completedCount = completed
      ? Math.max(input.lessonProgress.completedExercises, completedRequiredExercises)
      : input.lessonProgress.completedExercises;

    return {
      progress: {
        completedCount,
        totalCount,
        percent:
          input.lessonProgress.percent > 0
            ? Math.round(input.lessonProgress.percent)
            : calculateCompletionPercent(completedCount, totalCount),
        status
      },
      completed,
      started,
      unlocked: input.unlocked
    };
  }

  return {
    progress: {
      completedCount: completedRequiredExercises,
      totalCount: requiredExercises.length,
      percent: calculateCompletionPercent(completedRequiredExercises, requiredExercises.length),
      status
    },
    completed,
    started,
    unlocked: input.unlocked
  };
}

function buildSteps(lesson: CoursePathMapperLesson): CoursePathStepDto[] {
  const versionedSteps = buildVersionedContentSteps(lesson);
  const steps = versionedSteps.length > 0 ? versionedSteps : buildLegacyContentSteps(lesson);
  const referencedExerciseIds = new Set(
    steps
      .filter((step): step is Extract<CoursePathStepDto, { type: "exercise" }> =>
        step.type === "exercise"
      )
      .map((step) => step.exercise.id)
  );
  const lastOrder = steps.reduce((max, step) => Math.max(max, step.order), 0);
  const orphanExerciseSteps = lesson.exercises
    .filter((exercise) => !referencedExerciseIds.has(exercise.id))
    .sort((left, right) => left.order - right.order)
    .map((exercise, index) =>
      buildExerciseStep({
        lessonId: lesson.id,
        exercise,
        stepId: `exercise-${exercise.id}`,
        title: "Exercise",
        order: lastOrder + index + 1,
        required: true
      })
    )
    .filter((step): step is CoursePathStepDto => step !== null);

  return [...steps, ...orphanExerciseSteps].sort((left, right) => left.order - right.order);
}

function buildVersionedContentSteps(lesson: CoursePathMapperLesson): CoursePathStepDto[] {
  const content = asRecord(lesson.content);

  if (content?.version !== 2 || !Array.isArray(content.steps)) {
    return [];
  }

  const exercisesById = new Map(lesson.exercises.map((exercise) => [exercise.id, exercise]));

  return content.steps
    .map((rawStep, index) => {
      const step = asRecord(rawStep);

      if (!step || typeof step.type !== "string") {
        return null;
      }

      const order = typeof step.order === "number" ? step.order : index + 1;
      const required = typeof step.required === "boolean" ? step.required : true;
      const title = typeof step.title === "string" ? step.title : undefined;

      if (step.type === "exercise") {
        const exerciseId = typeof step.exerciseId === "string" ? step.exerciseId : undefined;
        const exercise = exerciseId ? exercisesById.get(exerciseId) : undefined;

        if (!exercise) {
          return null;
        }

        return buildExerciseStep({
          lessonId: lesson.id,
          exercise,
          stepId: typeof step.id === "string" ? step.id : `exercise-${exercise.id}`,
          title,
          order,
          required
        });
      }

      if (!isContentStepType(step.type)) {
        return null;
      }

      const metadata = asRecord(step.metadata);

      return {
        id: typeof step.id === "string" ? step.id : `${lesson.id}-${step.type}-${order}`,
        lessonId: lesson.id,
        type: step.type,
        ...(title ? { title } : {}),
        order,
        required,
        ...(typeof step.body === "string" ? { body: step.body } : {}),
        ...(metadata ? { metadata } : {}),
        progress: zeroProgress("available")
      };
    })
    .filter((step): step is CoursePathStepDto => step !== null);
}

function buildLegacyContentSteps(lesson: CoursePathMapperLesson): CoursePathStepDto[] {
  const content = asRecord(lesson.content);
  const steps: CoursePathStepDto[] = [];
  let order = 1;

  if (typeof content?.introduction === "string" && content.introduction.trim() !== "") {
    steps.push({
      id: `${lesson.id}-intro`,
      lessonId: lesson.id,
      type: "intro",
      title: lesson.title,
      order,
      required: true,
      body: content.introduction,
      progress: zeroProgress("available")
    });
    order += 1;
  }

  if (Array.isArray(content?.keyIdeas)) {
    const keyIdeas = content.keyIdeas.filter(
      (idea): idea is string => typeof idea === "string" && idea.trim() !== ""
    );

    if (keyIdeas.length > 0) {
      steps.push({
        id: `${lesson.id}-concepts`,
        lessonId: lesson.id,
        type: "concept",
        title: "Key ideas",
        order,
        required: true,
        body: keyIdeas.map((idea) => `- ${idea}`).join("\n"),
        progress: zeroProgress("available")
      });
      order += 1;
    }
  }

  const visualExplanation = asRecord(content?.visualExplanation);

  if (visualExplanation) {
    const variables = Array.isArray(visualExplanation.variables)
      ? visualExplanation.variables.filter((variable) => asRecord(variable) !== null)
      : [];

    steps.push({
      id: `${lesson.id}-visual-model`,
      lessonId: lesson.id,
      type: "visual_model",
      ...(typeof visualExplanation.title === "string" ? { title: visualExplanation.title } : {}),
      order,
      required: true,
      ...(typeof visualExplanation.description === "string"
        ? { body: visualExplanation.description }
        : {}),
      metadata: {
        variables
      },
      progress: zeroProgress("available")
    });
  }

  return steps;
}

function buildExerciseStep(input: {
  lessonId: string;
  exercise: CoursePathMapperExercise;
  stepId: string;
  title: string | undefined;
  order: number;
  required: boolean;
}): CoursePathStepDto | null {
  const exercise = buildExercise(input.exercise);

  if (!exercise) {
    return null;
  }

  return {
    id: input.stepId,
    lessonId: input.lessonId,
    type: "exercise",
    ...(input.title ? { title: input.title } : {}),
    order: input.order,
    required: input.required,
    exercise,
    progress: zeroProgress("available")
  };
}

function buildExercise(exercise: CoursePathMapperExercise): CoursePathExerciseDto | null {
  const type = exerciseTypeMap[exercise.type];

  if (!type) {
    return null;
  }

  const options = parseOptions(exercise.options);
  const steps = parseExerciseSteps(exercise.steps);
  const unit = parseUnit(exercise.options);

  return {
    id: exercise.id,
    type,
    prompt: exercise.prompt,
    ...(options.length > 0 ? { options } : {}),
    ...(steps.length > 0 ? { steps } : {}),
    ...(unit ? { unit } : {}),
    points: exercise.points,
    ...(exercise.explanation ? { explanation: exercise.explanation } : {})
  };
}

function attachStepProgress(
  step: CoursePathStepDto,
  lessonState: LessonProgressState,
  completedExerciseIds: ReadonlySet<string>,
  attemptedExerciseIds: ReadonlySet<string>
): CoursePathStepDto {
  if (step.type !== "exercise") {
    return {
      ...step,
      progress: zeroProgress(lessonState.completed ? "completed" : lessonState.progress.status)
    };
  }

  const completed = completedExerciseIds.has(step.exercise.id);
  const attempted = attemptedExerciseIds.has(step.exercise.id);
  const status = getAggregateStatus({
    completed,
    started: attempted,
    unlocked: lessonState.unlocked
  });

  return {
    ...step,
    progress: {
      completedCount: completed ? 1 : 0,
      totalCount: 1,
      percent: completed ? 100 : 0,
      status
    }
  };
}

function parseOptions(value: unknown): CoursePathExerciseOptionDto[] {
  return Array.isArray(value)
    ? value
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== null)
        .filter(
          (item) =>
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            typeof item.value === "string"
        )
        .map((item) => ({
          id: item.id as string,
          label: item.label as string,
          value: item.value as string
        }))
    : [];
}

function parseExerciseSteps(value: unknown): CoursePathExerciseStepDto[] {
  return Array.isArray(value)
    ? value
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== null)
        .filter((item) => typeof item.id === "string" && typeof item.prompt === "string")
        .map((item) => ({
          id: item.id as string,
          prompt: item.prompt as string,
          ...(typeof item.hint === "string" ? { hint: item.hint } : {})
        }))
    : [];
}

function parseUnit(value: unknown): string | undefined {
  const record = asRecord(value);

  return typeof record?.unit === "string" ? record.unit : undefined;
}

function getAggregateStatus(input: {
  completed: boolean;
  started: boolean;
  unlocked: boolean;
}): LearningStatus {
  if (input.completed) {
    return "completed";
  }

  if (!input.unlocked) {
    return "locked";
  }

  if (input.started) {
    return "in_progress";
  }

  return "available";
}

function zeroProgress(status: LearningStatus): CoursePathProgressDto {
  return {
    completedCount: 0,
    totalCount: 0,
    percent: 0,
    status
  };
}

function isContentStepType(value: string): value is Exclude<LessonStepType, "exercise"> {
  return contentStepTypes.some((type) => type === value);
}

function isRequiredExerciseStep(step: CoursePathStepDto): step is CoursePathExerciseStep {
  return step.type === "exercise" && step.required;
}

function isCompletedStatus(value: string | undefined): boolean {
  return value === "COMPLETED" || value === "completed";
}

function isNotStartedStatus(value: string): boolean {
  return value === "NOT_STARTED" || value === "not_started";
}

function isStartedStatus(value: LearningStatus): boolean {
  return value === "in_progress" || value === "completed";
}

function toSet(values: Iterable<string> | undefined): Set<string> {
  return values instanceof Set ? values : new Set(values ?? []);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
