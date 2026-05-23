import type {
  Exercise,
  ExerciseAnswer,
  ExerciseEvaluation,
  NumericAnswer
} from "../models/exercise";

export function evaluateExerciseAttempt(
  exercise: Exercise,
  submittedAnswer: unknown
): ExerciseEvaluation {
  const correct = isCorrectAnswer(exercise, submittedAnswer);
  const score = correct ? exercise.points : 0;
  const feedback = correct
    ? (exercise.explanation ?? "Correct. Your answer matches the underlying model.")
    : buildIncorrectFeedback(exercise);

  if (correct) {
    return {
      correct,
      score,
      feedback
    };
  }

  return {
    correct,
    score,
    feedback,
    expectedAnswer: exercise.correctAnswer
  };
}

function isCorrectAnswer(exercise: Exercise, submittedAnswer: unknown): boolean {
  switch (exercise.type) {
    case "multiple_choice":
      return normalizeString(submittedAnswer) === normalizeString(exercise.correctAnswer);
    case "numeric_input":
      return isNumericMatch(exercise.correctAnswer, submittedAnswer);
    case "step_by_step":
      return isStepByStepMatch(exercise, submittedAnswer);
    case "drag_and_drop":
    case "interactive_visualization":
    case "simulation":
      return stableJson(submittedAnswer) === stableJson(exercise.correctAnswer);
    default:
      return false;
  }
}

function isNumericMatch(expected: ExerciseAnswer, submitted: unknown): boolean {
  const expectedValue = typeof expected === "number" ? expected : readNumericAnswer(expected);
  const submittedValue = readNumericAnswer(submitted);

  if (expectedValue === null || submittedValue === null) {
    return false;
  }

  const tolerance = typeof expected === "object" && expected !== null ? readTolerance(expected) : 0;
  return Math.abs(expectedValue - submittedValue) <= tolerance;
}

function isStepByStepMatch(exercise: Exercise, submittedAnswer: unknown): boolean {
  if (!exercise.steps?.length || !isRecord(submittedAnswer)) {
    return false;
  }

  const submittedSteps = Array.isArray(submittedAnswer.steps) ? submittedAnswer.steps : [];

  return exercise.steps.every((step, index) => {
    if (step.expectedAnswer === undefined) {
      return true;
    }

    return stableJson(submittedSteps[index]) === stableJson(step.expectedAnswer);
  });
}

function buildIncorrectFeedback(exercise: Exercise): string {
  if (exercise.type === "numeric_input") {
    return "Not quite. Recheck the units, estimate the expected range, then calculate again.";
  }

  if (exercise.type === "step_by_step") {
    return "One of the reasoning steps needs adjustment. Compare each step against the claim it supports.";
  }

  return "Not quite. Use the explanation and try to connect the observation to the principle.";
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function readNumericAnswer(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (isNumericAnswer(value)) {
    return value.value;
  }

  return null;
}

function readTolerance(value: object): number {
  return isNumericAnswer(value) && value.tolerance !== undefined ? value.tolerance : 0;
}

function isNumericAnswer(value: unknown): value is NumericAnswer {
  return (
    isRecord(value) &&
    typeof value.value === "number" &&
    Number.isFinite(value.value) &&
    (value.tolerance === undefined || typeof value.tolerance === "number")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (isRecord(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortJson(value[key]);
        return result;
      }, {});
  }

  return value;
}
