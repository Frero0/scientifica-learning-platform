import type {
  EvaluationResult,
  LearningExercise,
  MultipleChoiceExercise,
  NumericInputAnswer,
  NumericInputExercise
} from "./types";

export function evaluateLearningExercise(
  exercise: LearningExercise,
  submittedAnswer: unknown
): EvaluationResult {
  switch (exercise.type) {
    case "multiple_choice":
      return evaluateMultipleChoiceExercise(exercise, submittedAnswer);
    case "numeric_input":
      return evaluateNumericInputExercise(exercise, submittedAnswer);
    case "step_by_step":
      return {
        correct: false,
        score: 0,
        maxScore: exercise.points,
        feedback: "Step-by-step exercises require per-step evaluation.",
        expectedAnswer: exercise.steps
          .filter((step) => step.expectedAnswer !== undefined)
          .map((step) => step.expectedAnswer)
      };
    default:
      return assertNever(exercise);
  }
}

export function evaluateMultipleChoiceExercise(
  exercise: MultipleChoiceExercise,
  submittedAnswer: unknown
): EvaluationResult {
  const correct = isMultipleChoiceMatch(exercise.correctAnswer, submittedAnswer);

  return buildEvaluationResult({
    correct,
    points: exercise.points,
    correctFeedback: exercise.explanation ?? "Correct.",
    incorrectFeedback: "Not quite. Review the options and try again.",
    expectedAnswer: exercise.correctAnswer
  });
}

export function evaluateNumericInputExercise(
  exercise: NumericInputExercise,
  submittedAnswer: unknown
): EvaluationResult {
  const correct = isNumericMatch(exercise.correctAnswer, submittedAnswer);

  return buildEvaluationResult({
    correct,
    points: exercise.points,
    correctFeedback: exercise.explanation ?? "Correct.",
    incorrectFeedback: "Not quite. Recheck the value, units, and allowed tolerance.",
    expectedAnswer: exercise.correctAnswer
  });
}

function buildEvaluationResult(input: {
  correct: boolean;
  points: number;
  correctFeedback: string;
  incorrectFeedback: string;
  expectedAnswer: unknown;
}): EvaluationResult {
  if (input.correct) {
    return {
      correct: true,
      score: input.points,
      maxScore: input.points,
      feedback: input.correctFeedback
    };
  }

  return {
    correct: false,
    score: 0,
    maxScore: input.points,
    feedback: input.incorrectFeedback,
    expectedAnswer: input.expectedAnswer
  };
}

function isMultipleChoiceMatch(expected: string | string[], submitted: unknown): boolean {
  const expectedValues = normalizeChoiceList(expected);
  const submittedValues = normalizeChoiceList(submitted);

  if (expectedValues.length !== submittedValues.length) {
    return false;
  }

  return expectedValues.every((value, index) => value === submittedValues[index]);
}

function normalizeChoiceList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean)
    .sort();
}

function isNumericMatch(expected: number | NumericInputAnswer, submitted: unknown): boolean {
  const expectedValue = typeof expected === "number" ? expected : expected.value;
  const submittedValue = readNumericValue(submitted);

  if (submittedValue === null) {
    return false;
  }

  const tolerance = typeof expected === "number" ? 0 : (expected.tolerance ?? 0);
  return Math.abs(expectedValue - submittedValue) <= tolerance;
}

function readNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (isNumericInputAnswer(value)) {
    return value.value;
  }

  return null;
}

function isNumericInputAnswer(value: unknown): value is NumericInputAnswer {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "value" in value &&
    typeof value.value === "number" &&
    Number.isFinite(value.value)
  );
}

function assertNever(value: never): never {
  throw new Error(`Unsupported learning exercise: ${JSON.stringify(value)}`);
}
