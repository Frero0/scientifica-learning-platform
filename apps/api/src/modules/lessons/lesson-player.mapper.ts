import { calculateCompletionPercent } from "@scientifica/domain";
import type { ExerciseType, LearningStatus, LessonStepType } from "@scientifica/domain";

import type {
  LessonPlayerContentStepDto,
  LessonPlayerDto,
  LessonPlayerExerciseOptionDto,
  LessonPlayerExerciseStateDto,
  LessonPlayerExerciseStepDto,
  LessonPlayerHintDto,
  LessonPlayerInteractiveStepDto,
  LessonPlayerNestedExerciseStepDto,
  LessonPlayerProgressDto,
  LessonPlayerQuizStepDto,
  LessonPlayerStepDto
} from "./lesson-player.types";

const contentStepTypes = [
  "intro",
  "concept",
  "visual_model",
  "reflection",
  "summary",
  "completion"
] as const satisfies ReadonlyArray<Exclude<LessonStepType, "exercise">>;

const exerciseTypeMap: Record<string, ExerciseType | undefined> = {
  MULTIPLE_CHOICE: "multiple_choice",
  NUMERIC_INPUT: "numeric_input",
  DRAG_AND_DROP: "drag_and_drop",
  INTERACTIVE_VISUALIZATION: "interactive_visualization",
  STEP_BY_STEP: "step_by_step",
  SIMULATION: "simulation",
  multiple_choice: "multiple_choice",
  numeric_input: "numeric_input",
  drag_and_drop: "drag_and_drop",
  interactive_visualization: "interactive_visualization",
  step_by_step: "step_by_step",
  simulation: "simulation"
};

export type LessonPlayerMapperLesson = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  summary: string;
  content: unknown;
  durationMinutes: number;
  order: number;
  module: {
    id: string;
    title: string;
    order: number;
    course: {
      id: string;
      slug: string;
      title: string;
    };
  };
  exercises: LessonPlayerMapperExercise[];
};

export type LessonPlayerMapperExercise = {
  id: string;
  lessonId: string;
  type: string;
  prompt: string;
  explanation?: string | null;
  options?: unknown;
  steps?: unknown;
  visual?: unknown;
  points: number;
  order: number;
};

export type LessonPlayerMapperProgressInput = {
  lessonProgress?: LessonPlayerMapperLessonProgress;
  completedExerciseIds?: Iterable<string>;
  attemptedExerciseIds?: Iterable<string>;
};

export type LessonPlayerMapperLessonProgress = {
  lessonId: string | null;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: string;
  lastExerciseId?: string | null;
};

type EvaluableStep = Extract<
  LessonPlayerStepDto,
  { type: "quiz" } | { type: "exercise" } | { type: "interactive" }
>;

export function mapLessonToLessonPlayerDto(
  lesson: LessonPlayerMapperLesson,
  progressInput: LessonPlayerMapperProgressInput = {}
): LessonPlayerDto {
  const completedExerciseIds = toSet(progressInput.completedExerciseIds);
  const attemptedExerciseIds = toSet(progressInput.attemptedExerciseIds);
  const baseSteps = buildSteps(lesson);
  const progress = buildLessonProgress(baseSteps, progressInput.lessonProgress, {
    completedExerciseIds,
    attemptedExerciseIds
  });
  const steps = attachProgressToSteps(baseSteps, progress, {
    completedExerciseIds,
    attemptedExerciseIds
  });

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    durationMinutes: lesson.durationMinutes,
    order: lesson.order,
    course: {
      id: lesson.module.course.id,
      slug: lesson.module.course.slug,
      title: lesson.module.course.title
    },
    level: {
      id: lesson.module.id,
      title: lesson.module.title,
      order: lesson.module.order
    },
    progress,
    steps
  };
}

function buildLessonProgress(
  steps: LessonPlayerStepDto[],
  lessonProgress: LessonPlayerMapperLessonProgress | undefined,
  state: {
    completedExerciseIds: ReadonlySet<string>;
    attemptedExerciseIds: ReadonlySet<string>;
  }
): LessonPlayerProgressDto {
  const evaluableSteps = steps.filter(isEvaluableStep);
  const requiredEvaluableSteps = evaluableSteps.filter((step) => step.required);
  const completedRequiredSteps = requiredEvaluableSteps.filter((step) =>
    state.completedExerciseIds.has(getStepExerciseId(step))
  );
  const completed =
    isCompletedStatus(lessonProgress?.status) ||
    (requiredEvaluableSteps.length > 0 &&
      completedRequiredSteps.length >= requiredEvaluableSteps.length);
  const started =
    (lessonProgress !== undefined && !isNotStartedStatus(lessonProgress.status)) ||
    evaluableSteps.some((step) => {
      const exerciseId = getStepExerciseId(step);
      return state.attemptedExerciseIds.has(exerciseId) || state.completedExerciseIds.has(exerciseId);
    });
  const totalCount =
    lessonProgress && lessonProgress.totalExercises > 0
      ? lessonProgress.totalExercises
      : requiredEvaluableSteps.length;
  const completedCount = completed
    ? Math.max(lessonProgress?.completedExercises ?? 0, completedRequiredSteps.length)
    : Math.max(lessonProgress?.completedExercises ?? 0, completedRequiredSteps.length);
  const status = getAggregateStatus({
    completed,
    started,
    unlocked: true
  });
  const currentStepId = findCurrentStepId(steps, lessonProgress?.lastExerciseId, {
    completed,
    completedExerciseIds: state.completedExerciseIds,
    attemptedExerciseIds: state.attemptedExerciseIds
  });
  const completedStepIds = steps
    .filter((step) =>
      isStepCompleted(step, steps, completed, currentStepId, state.completedExerciseIds)
    )
    .map((step) => step.id);

  return {
    completed,
    ...(currentStepId ? { currentStepId } : {}),
    completedStepIds,
    completedCount,
    totalCount,
    percent:
      lessonProgress && lessonProgress.percent > 0
        ? Math.round(lessonProgress.percent)
        : calculateCompletionPercent(completedCount, totalCount),
    status,
    exercises: evaluableSteps.map((step) => buildExerciseState(step, state))
  };
}

function attachProgressToSteps(
  steps: LessonPlayerStepDto[],
  progress: LessonPlayerProgressDto,
  state: {
    completedExerciseIds: ReadonlySet<string>;
    attemptedExerciseIds: ReadonlySet<string>;
  }
): LessonPlayerStepDto[] {
  const completedStepIds = new Set(progress.completedStepIds);

  return steps.map((step) => {
    const unlocked = progress.completed || isStepUnlocked(step, steps, state.completedExerciseIds);
    const completed = completedStepIds.has(step.id);
    const status = getAggregateStatus({
      completed,
      started:
        isEvaluableStep(step) && state.attemptedExerciseIds.has(getStepExerciseId(step)),
      unlocked
    });

    return {
      ...step,
      progress: {
        status,
        locked: !unlocked,
        current: progress.currentStepId === step.id,
        completed
      }
    };
  });
}

function buildSteps(lesson: LessonPlayerMapperLesson): LessonPlayerStepDto[] {
  const versionedSteps = buildVersionedContentSteps(lesson);
  const steps = versionedSteps.length > 0 ? versionedSteps : buildLegacyContentSteps(lesson);
  const referencedExerciseIds = new Set(
    steps.filter(isEvaluableStep).map((step) => getStepExerciseId(step))
  );
  const lastOrder = steps.reduce((max, step) => Math.max(max, step.order), 0);
  const orphanExerciseSteps = lesson.exercises
    .filter((exercise) => !referencedExerciseIds.has(exercise.id))
    .sort((left, right) => left.order - right.order)
    .map((exercise, index) =>
      buildExerciseBackedStep({
        lessonId: lesson.id,
        exercise,
        stepId: `exercise-${exercise.id}`,
        title: "Exercise",
        order: lastOrder + index + 1,
        required: true,
        hints: []
      })
    )
    .filter((step): step is LessonPlayerStepDto => step !== null);

  return [...steps, ...orphanExerciseSteps].sort((left, right) => left.order - right.order);
}

function buildVersionedContentSteps(lesson: LessonPlayerMapperLesson): LessonPlayerStepDto[] {
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
      const hints = parseHints(step.hints ?? step.progressiveHints);

      if (step.type === "exercise") {
        const exerciseId = typeof step.exerciseId === "string" ? step.exerciseId : undefined;
        const exercise = exerciseId ? exercisesById.get(exerciseId) : undefined;

        if (!exercise) {
          return null;
        }

        return buildExerciseBackedStep({
          lessonId: lesson.id,
          exercise,
          stepId: typeof step.id === "string" ? step.id : `exercise-${exercise.id}`,
          title,
          order,
          required,
          hints
        });
      }

      if (!isContentStepType(step.type)) {
        return null;
      }

      const metadata = asRecord(step.metadata);

      return buildContentStep({
        id: typeof step.id === "string" ? step.id : `${lesson.id}-${step.type}-${order}`,
        lessonId: lesson.id,
        kind: step.type,
        title,
        order,
        required,
        body: typeof step.body === "string" ? step.body : undefined,
        hints,
        metadata
      });
    })
    .filter((step): step is LessonPlayerStepDto => step !== null);
}

function buildLegacyContentSteps(lesson: LessonPlayerMapperLesson): LessonPlayerStepDto[] {
  const content = asRecord(lesson.content);
  const steps: LessonPlayerStepDto[] = [];
  let order = 1;

  if (typeof content?.introduction === "string" && content.introduction.trim() !== "") {
    steps.push(
      buildContentStep({
        id: `${lesson.id}-intro`,
        lessonId: lesson.id,
        kind: "intro",
        title: lesson.title,
        order,
        required: true,
        body: content.introduction
      })
    );
    order += 1;
  }

  if (Array.isArray(content?.keyIdeas)) {
    const keyIdeas = content.keyIdeas.filter(
      (idea): idea is string => typeof idea === "string" && idea.trim() !== ""
    );

    if (keyIdeas.length > 0) {
      steps.push(
        buildContentStep({
          id: `${lesson.id}-concepts`,
          lessonId: lesson.id,
          kind: "concept",
          title: "Key ideas",
          order,
          required: true,
          body: keyIdeas.map((idea) => `- ${idea}`).join("\n"),
          keyIdeas
        })
      );
      order += 1;
    }
  }

  const visualExplanation = asRecord(content?.visualExplanation);

  if (visualExplanation) {
    const variables = Array.isArray(visualExplanation.variables)
      ? visualExplanation.variables.filter((variable): variable is Record<string, unknown> =>
          Boolean(asRecord(variable))
        )
      : [];

    steps.push(
      buildContentStep({
        id: `${lesson.id}-visual-model`,
        lessonId: lesson.id,
        kind: "visual_model",
        title: typeof visualExplanation.title === "string" ? visualExplanation.title : undefined,
        order,
        required: true,
        body:
          typeof visualExplanation.description === "string"
            ? visualExplanation.description
            : undefined,
        visual: {
          ...(typeof visualExplanation.title === "string"
            ? { title: visualExplanation.title }
            : {}),
          ...(typeof visualExplanation.description === "string"
            ? { description: visualExplanation.description }
            : {}),
          variables
        }
      })
    );
  }

  return steps;
}

function buildContentStep(input: {
  id: string;
  lessonId: string;
  kind: Exclude<LessonStepType, "exercise">;
  title?: string;
  order: number;
  required: boolean;
  body?: string;
  keyIdeas?: string[];
  visual?: LessonPlayerContentStepDto["content"]["visual"];
  hints?: LessonPlayerHintDto[];
  metadata?: Record<string, unknown> | null;
}): LessonPlayerContentStepDto {
  return {
    id: input.id,
    lessonId: input.lessonId,
    type: "content",
    ...(input.title ? { title: input.title } : {}),
    order: input.order,
    required: input.required,
    progress: emptyStepProgress(),
    content: {
      kind: input.kind,
      ...(input.body ? { body: input.body } : {}),
      ...(input.keyIdeas && input.keyIdeas.length > 0 ? { keyIdeas: input.keyIdeas } : {}),
      ...(input.visual ? { visual: input.visual } : {}),
      ...(input.hints && input.hints.length > 0 ? { hints: input.hints } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {})
    }
  };
}

function buildExerciseBackedStep(input: {
  lessonId: string;
  exercise: LessonPlayerMapperExercise;
  stepId: string;
  title: string | undefined;
  order: number;
  required: boolean;
  hints: LessonPlayerHintDto[];
}): LessonPlayerStepDto | null {
  const exerciseType = exerciseTypeMap[input.exercise.type];

  if (!exerciseType) {
    return null;
  }

  const base = {
    id: input.stepId,
    lessonId: input.lessonId,
    ...(input.title ? { title: input.title } : {}),
    order: input.order,
    required: input.required,
    progress: emptyStepProgress()
  };
  const exerciseBase = {
    id: input.exercise.id,
    exerciseType,
    prompt: input.exercise.prompt,
    points: input.exercise.points,
    ...(input.exercise.explanation ? { explanation: input.exercise.explanation } : {}),
    ...(input.hints.length > 0 ? { hints: input.hints } : {})
  };

  if (exerciseType === "multiple_choice") {
    return {
      ...base,
      type: "quiz",
      quiz: {
        ...exerciseBase,
        exerciseType,
        options: parseOptions(input.exercise.options)
      }
    } satisfies LessonPlayerQuizStepDto;
  }

  if (exerciseType === "numeric_input") {
    const unit = parseUnit(input.exercise.options);

    return {
      ...base,
      type: "exercise",
      exercise: {
        ...exerciseBase,
        exerciseType,
        ...(unit ? { unit } : {})
      }
    } satisfies LessonPlayerExerciseStepDto;
  }

  if (exerciseType === "step_by_step") {
    return {
      ...base,
      type: "exercise",
      exercise: {
        ...exerciseBase,
        exerciseType,
        steps: parseExerciseSteps(input.exercise.steps)
      }
    } satisfies LessonPlayerExerciseStepDto;
  }

  return {
    ...base,
    type: "interactive",
    interactive: {
      ...exerciseBase,
      exerciseType,
      ...(parseOptions(input.exercise.options).length > 0
        ? { options: parseOptions(input.exercise.options) }
        : {}),
      ...(asRecord(input.exercise.visual) ? { visualization: asRecord(input.exercise.visual)! } : {})
    }
  } satisfies LessonPlayerInteractiveStepDto;
}

function findCurrentStepId(
  steps: LessonPlayerStepDto[],
  lastExerciseId: string | null | undefined,
  state: {
    completed: boolean;
    completedExerciseIds: ReadonlySet<string>;
    attemptedExerciseIds: ReadonlySet<string>;
  }
): string | undefined {
  if (steps.length === 0) {
    return undefined;
  }

  if (state.completed) {
    return steps[steps.length - 1]?.id;
  }

  const lastExerciseStep = lastExerciseId
    ? steps
        .filter(isEvaluableStep)
        .find((step) => getStepExerciseId(step) === lastExerciseId)
    : undefined;

  if (lastExerciseStep && !state.completedExerciseIds.has(getStepExerciseId(lastExerciseStep))) {
    return lastExerciseStep.id;
  }

  const attemptedIncompleteStep = steps.find(
    (step): step is EvaluableStep =>
      isEvaluableStep(step) &&
      state.attemptedExerciseIds.has(getStepExerciseId(step)) &&
      !state.completedExerciseIds.has(getStepExerciseId(step))
  );

  if (attemptedIncompleteStep) {
    return attemptedIncompleteStep.id;
  }

  const highestCompletedOrder = steps.reduce((max, step) => {
    if (isEvaluableStep(step) && state.completedExerciseIds.has(getStepExerciseId(step))) {
      return Math.max(max, step.order);
    }

    return max;
  }, 0);

  if (highestCompletedOrder > 0) {
    return steps.find((step) => step.order > highestCompletedOrder)?.id ?? steps[steps.length - 1]?.id;
  }

  return steps[0]?.id;
}

function isStepCompleted(
  step: LessonPlayerStepDto,
  allSteps: LessonPlayerStepDto[],
  lessonCompleted: boolean,
  currentStepId: string | undefined,
  completedExerciseIds: ReadonlySet<string>
): boolean {
  if (lessonCompleted) {
    return true;
  }

  if (isEvaluableStep(step)) {
    return completedExerciseIds.has(getStepExerciseId(step));
  }

  const currentStepOrder = currentStepId ? stepOrderForId(currentStepId, allSteps) : undefined;
  return currentStepOrder !== undefined && step.order < currentStepOrder;
}

function stepOrderForId(id: string, steps: LessonPlayerStepDto[]): number | undefined {
  return steps.find((step) => step.id === id)?.order;
}

function isStepUnlocked(
  step: LessonPlayerStepDto,
  allSteps: LessonPlayerStepDto[],
  completedExerciseIds: ReadonlySet<string>
): boolean {
  return allSteps
    .filter(isEvaluableStep)
    .filter((candidate) => candidate.order < step.order && candidate.required)
    .every((candidate) => completedExerciseIds.has(getStepExerciseId(candidate)));
}

function buildExerciseState(
  step: EvaluableStep,
  state: {
    completedExerciseIds: ReadonlySet<string>;
    attemptedExerciseIds: ReadonlySet<string>;
  }
): LessonPlayerExerciseStateDto {
  const exerciseId = getStepExerciseId(step);
  const completed = state.completedExerciseIds.has(exerciseId);
  const attempted = completed || state.attemptedExerciseIds.has(exerciseId);

  return {
    exerciseId,
    stepId: step.id,
    status: completed ? "completed" : attempted ? "attempted" : "not_started",
    attempted,
    completed,
    ...(completed ? { result: "success" as const } : attempted ? { result: "failure" as const } : {})
  };
}

function getStepExerciseId(step: EvaluableStep): string {
  switch (step.type) {
    case "quiz":
      return step.quiz.id;
    case "exercise":
      return step.exercise.id;
    case "interactive":
      return step.interactive.id;
  }
}

function parseOptions(value: unknown): LessonPlayerExerciseOptionDto[] {
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

function parseExerciseSteps(value: unknown): LessonPlayerNestedExerciseStepDto[] {
  return Array.isArray(value)
    ? value
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== null)
        .filter((item) => typeof item.id === "string" && typeof item.prompt === "string")
        .map((item) => ({
          id: item.id as string,
          ...(typeof item.title === "string" ? { title: item.title } : {}),
          prompt: item.prompt as string,
          ...(typeof item.hint === "string" ? { hint: item.hint } : {})
        }))
    : [];
}

function parseHints(value: unknown): LessonPlayerHintDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (typeof item === "string" && item.trim() !== "") {
        return {
          id: `hint-${index + 1}`,
          body: item
        };
      }

      const record = asRecord(item);

      if (!record || typeof record.body !== "string") {
        return null;
      }

      return {
        ...(typeof record.id === "string" ? { id: record.id } : {}),
        body: record.body
      };
    })
    .filter((hint): hint is LessonPlayerHintDto => hint !== null);
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

function emptyStepProgress() {
  return {
    status: "available" as const,
    locked: false,
    current: false,
    completed: false
  };
}

function isContentStepType(value: string): value is Exclude<LessonStepType, "exercise"> {
  return contentStepTypes.some((type) => type === value);
}

function isEvaluableStep(step: LessonPlayerStepDto): step is EvaluableStep {
  return step.type === "quiz" || step.type === "exercise" || step.type === "interactive";
}

function isCompletedStatus(value: string | undefined): boolean {
  return value === "COMPLETED" || value === "completed";
}

function isNotStartedStatus(value: string): boolean {
  return value === "NOT_STARTED" || value === "not_started";
}

function toSet(values: Iterable<string> | undefined): Set<string> {
  return values instanceof Set ? values : new Set(values ?? []);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
