import {
  learningExerciseTypes,
  lessonStepTypes,
  type Course,
  type LearningExercise,
  type Lesson,
  type LessonStep,
  type Level,
  type Subject
} from "./types";

export type LearningContent = Subject;

export type LearningValidationIssue = {
  path: string;
  message: string;
};

export type LearningSafeParseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: LearningContentValidationError;
    };

export class LearningContentValidationError extends Error {
  readonly issues: LearningValidationIssue[];

  constructor(issues: LearningValidationIssue[]) {
    super(formatIssues(issues));
    this.name = "LearningContentValidationError";
    this.issues = issues;
  }
}

type PathSegment = string | number;

type Validator<T> = (input: unknown) => LearningSafeParseResult<T>;

// Documented future exercise types. They remain rejected by the MVP schema.
const futureExerciseTypes = [
  "drag_and_drop",
  "interactive_visualization",
  "simulation",
  "expression_builder"
] as const;

export function parseLearningContent(input: unknown): LearningContent {
  return parseWith(input, safeParseLearningContent);
}

export function safeParseLearningContent(input: unknown): LearningSafeParseResult<LearningContent> {
  return safeParseWith(input, collectSubjectIssues);
}

export function parseSubject(input: unknown): Subject {
  return parseLearningContent(input);
}

export function safeParseSubject(input: unknown): LearningSafeParseResult<Subject> {
  return safeParseLearningContent(input);
}

export function parseCourse(input: unknown): Course {
  return parseWith(input, safeParseCourse);
}

export function safeParseCourse(input: unknown): LearningSafeParseResult<Course> {
  return safeParseWith(input, collectCourseIssues);
}

export function parseLevel(input: unknown): Level {
  return parseWith(input, safeParseLevel);
}

export function safeParseLevel(input: unknown): LearningSafeParseResult<Level> {
  return safeParseWith(input, collectLevelIssues);
}

export function parseLesson(input: unknown): Lesson {
  return parseWith(input, safeParseLesson);
}

export function safeParseLesson(input: unknown): LearningSafeParseResult<Lesson> {
  return safeParseWith(input, collectLessonIssues);
}

export function parseLessonStep(input: unknown): LessonStep {
  return parseWith(input, safeParseLessonStep);
}

export function safeParseLessonStep(input: unknown): LearningSafeParseResult<LessonStep> {
  return safeParseWith(input, collectLessonStepIssues);
}

export function parseLearningExercise(input: unknown): LearningExercise {
  return parseWith(input, safeParseLearningExercise);
}

export function safeParseLearningExercise(
  input: unknown
): LearningSafeParseResult<LearningExercise> {
  return safeParseWith(input, collectLearningExerciseIssues);
}

export function validateLearningContent(input: unknown): LearningValidationIssue[] {
  return collectSubjectIssues(input, []);
}

export function validateSubject(input: unknown): LearningValidationIssue[] {
  return validateLearningContent(input);
}

export function validateCourse(input: unknown): LearningValidationIssue[] {
  return collectCourseIssues(input, []);
}

export function validateLevel(input: unknown): LearningValidationIssue[] {
  return collectLevelIssues(input, []);
}

export function validateLesson(input: unknown): LearningValidationIssue[] {
  return collectLessonIssues(input, []);
}

export function validateLessonStep(input: unknown): LearningValidationIssue[] {
  return collectLessonStepIssues(input, []);
}

export function validateLearningExercise(input: unknown): LearningValidationIssue[] {
  return collectLearningExerciseIssues(input, []);
}

function parseWith<T>(input: unknown, parser: Validator<T>): T {
  const result = parser(input);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

function safeParseWith<T>(
  input: unknown,
  collectIssues: (input: unknown, path: PathSegment[]) => LearningValidationIssue[]
): LearningSafeParseResult<T> {
  const issues = collectIssues(input, []);

  if (issues.length > 0) {
    return {
      success: false,
      error: new LearningContentValidationError(issues)
    };
  }

  return {
    success: true,
    data: input as T
  };
}

function collectSubjectIssues(input: unknown, path: PathSegment[]): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected subject object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  requireString(input, "slug", path, issues);
  requireString(input, "title", path, issues);
  optionalString(input, "summary", path, issues);
  optionalString(input, "description", path, issues);
  optionalString(input, "color", path, issues);
  optionalString(input, "icon", path, issues);
  requireOrder(input, path, issues);

  if ("courses" in input) {
    optionalArray(input, "courses", path, issues, collectCourseIssues);
  }

  return issues;
}

function collectCourseIssues(input: unknown, path: PathSegment[]): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected course object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  optionalString(input, "subjectId", path, issues);
  requireString(input, "slug", path, issues);
  requireString(input, "title", path, issues);
  requireString(input, "summary", path, issues);
  optionalString(input, "description", path, issues);
  optionalNonNegativeNumber(input, "estimatedMinutes", path, issues);
  requireOrder(input, path, issues);
  optionalStringArray(input, "prerequisites", path, issues);
  requireArray(input, "levels", path, issues, collectLevelIssues);

  if (Array.isArray(input.levels) && input.levels.length === 0) {
    issues.push(issue([...path, "levels"], "Expected at least one level."));
  }

  return issues;
}

function collectLevelIssues(input: unknown, path: PathSegment[]): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected level object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  requireString(input, "courseId", path, issues);
  optionalString(input, "slug", path, issues);
  requireString(input, "title", path, issues);
  optionalString(input, "summary", path, issues);
  optionalString(input, "description", path, issues);
  requireOrder(input, path, issues);
  optionalStringArray(input, "prerequisites", path, issues);
  requireArray(input, "lessons", path, issues, collectLessonIssues);

  if (Array.isArray(input.lessons) && input.lessons.length === 0) {
    issues.push(issue([...path, "lessons"], "Expected at least one lesson."));
  }

  return issues;
}

function collectLessonIssues(input: unknown, path: PathSegment[]): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected lesson object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  requireString(input, "levelId", path, issues);
  requireString(input, "slug", path, issues);
  requireString(input, "title", path, issues);
  optionalString(input, "summary", path, issues);
  optionalNonNegativeNumber(input, "durationMinutes", path, issues);
  requireOrder(input, path, issues);
  optionalStringArray(input, "prerequisites", path, issues);
  requireArray(input, "steps", path, issues, collectLessonStepIssues);

  if (Array.isArray(input.steps) && input.steps.length === 0) {
    issues.push(issue([...path, "steps"], "Expected at least one step."));
  }

  if (Array.isArray(input.steps) && input.steps.length > 0 && !input.steps.some(isActionStep)) {
    issues.push(
      issue([...path, "steps"], "Expected at least one action step of type exercise or reflection.")
    );
  }

  return issues;
}

function collectLessonStepIssues(input: unknown, path: PathSegment[]): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected lesson step object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  optionalString(input, "lessonId", path, issues);
  requireStepType(input, path, issues);
  optionalString(input, "title", path, issues);
  requireOrder(input, path, issues);
  optionalBoolean(input, "required", path, issues);
  optionalRecord(input, "metadata", path, issues);

  if (input.type === "exercise") {
    if (!("exercise" in input)) {
      issues.push(issue([...path, "exercise"], "Expected learning exercise object."));
    } else {
      issues.push(...collectLearningExerciseIssues(input.exercise, [...path, "exercise"]));
    }
  } else {
    optionalString(input, "body", path, issues);
  }

  return issues;
}

function collectLearningExerciseIssues(
  input: unknown,
  path: PathSegment[]
): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected learning exercise object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  requireExerciseType(input, path, issues);
  requireString(input, "prompt", path, issues);
  requireNonNegativeNumber(input, "points", path, issues);
  optionalString(input, "explanation", path, issues);

  switch (input.type) {
    case "multiple_choice":
      collectMultipleChoiceExerciseIssues(input, path, issues);
      break;
    case "numeric_input":
      collectNumericInputExerciseIssues(input, path, issues);
      break;
    case "step_by_step":
      collectStepByStepExerciseIssues(input, path, issues);
      break;
  }

  return issues;
}

function collectMultipleChoiceExerciseIssues(
  input: Record<string, unknown>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  requireArray(input, "options", path, issues, collectExerciseOptionIssues);

  if (Array.isArray(input.options)) {
    if (input.options.length < 2) {
      issues.push(issue([...path, "options"], "Expected at least two options."));
    }

    const optionValues = readOptionValues(input.options);
    if (optionValues.size !== input.options.length) {
      issues.push(issue([...path, "options"], "Expected unique option values."));
    }

    validateMultipleChoiceCorrectAnswer(input.correctAnswer, optionValues, path, issues);
  } else if (!("correctAnswer" in input)) {
    issues.push(issue([...path, "correctAnswer"], "Expected string or string array."));
  } else {
    validateMultipleChoiceCorrectAnswer(input.correctAnswer, new Set(), path, issues);
  }
}

function collectNumericInputExerciseIssues(
  input: Record<string, unknown>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  validateNumericCorrectAnswer(input.correctAnswer, path, issues);
  optionalString(input, "unit", path, issues);
}

function collectStepByStepExerciseIssues(
  input: Record<string, unknown>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  requireArray(input, "steps", path, issues, collectStepByStepExerciseStepIssues);

  if (Array.isArray(input.steps) && input.steps.length === 0) {
    issues.push(issue([...path, "steps"], "Expected at least one guided step."));
  }
}

function collectExerciseOptionIssues(
  input: unknown,
  path: PathSegment[]
): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected exercise option object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  requireString(input, "label", path, issues);
  requireString(input, "value", path, issues);

  return issues;
}

function collectStepByStepExerciseStepIssues(
  input: unknown,
  path: PathSegment[]
): LearningValidationIssue[] {
  const issues: LearningValidationIssue[] = [];

  if (!isRecord(input)) {
    issues.push(issue(path, "Expected step-by-step exercise step object."));
    return issues;
  }

  requireString(input, "id", path, issues);
  requireString(input, "prompt", path, issues);
  optionalString(input, "hint", path, issues);

  return issues;
}

function requireString(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (!(key in input) || !isNonEmptyString(input[key])) {
    issues.push(issue([...path, key], "Expected non-empty string."));
  }
}

function optionalString(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (key in input && input[key] !== undefined && typeof input[key] !== "string") {
    issues.push(issue([...path, key], "Expected string."));
  }
}

function requireOrder(
  input: Record<string, unknown>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (!("order" in input) || !isNonNegativeInteger(input.order)) {
    issues.push(issue([...path, "order"], "Expected non-negative integer."));
  }
}

function requireNonNegativeNumber(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (!(key in input) || !isNonNegativeNumber(input[key])) {
    issues.push(issue([...path, key], "Expected non-negative finite number."));
  }
}

function optionalNonNegativeNumber(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (key in input && input[key] !== undefined && !isNonNegativeNumber(input[key])) {
    issues.push(issue([...path, key], "Expected non-negative finite number."));
  }
}

function optionalBoolean(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (key in input && input[key] !== undefined && typeof input[key] !== "boolean") {
    issues.push(issue([...path, key], "Expected boolean."));
  }
}

function optionalRecord(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (key in input && input[key] !== undefined && !isRecord(input[key])) {
    issues.push(issue([...path, key], "Expected object."));
  }
}

function requireArray(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[],
  collectItemIssues: (item: unknown, path: PathSegment[]) => LearningValidationIssue[]
): void {
  if (!Array.isArray(input[key])) {
    issues.push(issue([...path, key], "Expected array."));
    return;
  }

  input[key].forEach((item, index) => {
    issues.push(...collectItemIssues(item, [...path, key, index]));
  });
}

function optionalArray(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[],
  collectItemIssues: (item: unknown, path: PathSegment[]) => LearningValidationIssue[]
): void {
  if (input[key] === undefined) {
    return;
  }

  if (!Array.isArray(input[key])) {
    issues.push(issue([...path, key], "Expected array."));
    return;
  }

  input[key].forEach((item, index) => {
    issues.push(...collectItemIssues(item, [...path, key, index]));
  });
}

function optionalStringArray(
  input: Record<string, unknown>,
  key: string,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (!(key in input) || input[key] === undefined) {
    return;
  }

  if (!Array.isArray(input[key])) {
    issues.push(issue([...path, key], "Expected string array."));
    return;
  }

  input[key].forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      issues.push(issue([...path, key, index], "Expected non-empty string."));
    }
  });
}

function requireStepType(
  input: Record<string, unknown>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (!isOneOf(input.type, lessonStepTypes)) {
    issues.push(issue([...path, "type"], `Expected one of: ${lessonStepTypes.join(", ")}.`));
  }
}

function requireExerciseType(
  input: Record<string, unknown>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (!isOneOf(input.type, learningExerciseTypes)) {
    const futureTypeMessage = isOneOf(input.type, futureExerciseTypes)
      ? " Future exercise types are documented but not accepted by the MVP schema yet."
      : "";

    issues.push(
      issue(
        [...path, "type"],
        `Expected one of: ${learningExerciseTypes.join(", ")}.${futureTypeMessage}`
      )
    );
  }
}

function validateMultipleChoiceCorrectAnswer(
  value: unknown,
  optionValues: Set<string>,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  const correctAnswers = Array.isArray(value) ? value : [value];

  if (!correctAnswers.every(isNonEmptyString)) {
    issues.push(issue([...path, "correctAnswer"], "Expected string or non-empty string array."));
    return;
  }

  if (correctAnswers.length === 0) {
    issues.push(issue([...path, "correctAnswer"], "Expected at least one answer."));
    return;
  }

  if (optionValues.size === 0) {
    return;
  }

  correctAnswers.forEach((answer, index) => {
    if (!optionValues.has(answer)) {
      const answerPath = Array.isArray(value)
        ? [...path, "correctAnswer", index]
        : [...path, "correctAnswer"];
      issues.push(issue(answerPath, "Expected answer to match an option value."));
    }
  });
}

function validateNumericCorrectAnswer(
  value: unknown,
  path: PathSegment[],
  issues: LearningValidationIssue[]
): void {
  if (isFiniteNumber(value)) {
    return;
  }

  if (!isRecord(value)) {
    issues.push(
      issue([...path, "correctAnswer"], "Expected finite number or numeric answer object.")
    );
    return;
  }

  if (!isFiniteNumber(value.value)) {
    issues.push(issue([...path, "correctAnswer", "value"], "Expected finite number."));
  }

  if (
    "tolerance" in value &&
    value.tolerance !== undefined &&
    !isNonNegativeNumber(value.tolerance)
  ) {
    issues.push(
      issue([...path, "correctAnswer", "tolerance"], "Expected non-negative finite number.")
    );
  }
}

function readOptionValues(options: unknown[]): Set<string> {
  const values = new Set<string>();

  options.forEach((option) => {
    if (isRecord(option) && isNonEmptyString(option.value)) {
      values.add(option.value);
    }
  });

  return values;
}

function isActionStep(value: unknown): boolean {
  return isRecord(value) && (value.type === "exercise" || value.type === "reflection");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 0;
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowedValues: T
): value is T[number] {
  return typeof value === "string" && allowedValues.includes(value);
}

function issue(path: PathSegment[], message: string): LearningValidationIssue {
  return {
    path: formatPath(path),
    message
  };
}

function formatPath(path: PathSegment[]): string {
  if (path.length === 0) {
    return "<root>";
  }

  return path.reduce<string>((formattedPath, segment) => {
    if (typeof segment === "number") {
      return `${formattedPath}[${segment}]`;
    }

    return formattedPath === "" ? segment : `${formattedPath}.${segment}`;
  }, "");
}

function formatIssues(issues: LearningValidationIssue[]): string {
  return [
    "Invalid learning content.",
    ...issues.map((validationIssue) => `- ${validationIssue.path}: ${validationIssue.message}`)
  ].join("\n");
}
