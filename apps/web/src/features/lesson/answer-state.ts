export type AnswerState = Record<string, unknown>;

type AnswerableExercise = {
  id: string;
  exerciseType: string;
  steps?: readonly unknown[];
};

export function getStoredAnswer(answerState: AnswerState, exercise: AnswerableExercise): unknown {
  return answerState[exercise.id] ?? getEmptyAnswer(exercise);
}

export function getEmptyAnswer(exercise: AnswerableExercise): unknown {
  if (exercise.exerciseType === "step_by_step") {
    return {
      steps: exercise.steps?.map(() => "") ?? []
    };
  }

  return "";
}

export function withExerciseAnswer(
  answerState: AnswerState,
  exerciseId: string,
  answer: unknown
): AnswerState {
  return {
    ...answerState,
    [exerciseId]: answer
  };
}

export function withStepAnswer(
  answerState: AnswerState,
  exercise: AnswerableExercise,
  stepIndex: number,
  value: string
): AnswerState {
  const currentAnswer = getStoredAnswer(answerState, exercise);
  const currentSteps = readStepAnswers(currentAnswer);
  const nextSteps = [...currentSteps];
  nextSteps[stepIndex] = value;

  return withExerciseAnswer(answerState, exercise.id, {
    steps: nextSteps
  });
}

export function readStepAnswers(answer: unknown): string[] {
  if (
    typeof answer === "object" &&
    answer !== null &&
    "steps" in answer &&
    Array.isArray((answer as { steps: unknown }).steps)
  ) {
    return (answer as { steps: unknown[] }).steps.map((step) =>
      typeof step === "string" ? step : ""
    );
  }

  return [];
}
