export type { Achievement } from "./models/achievement";
export type { Course, CourseLevel, LearningModule } from "./models/course";
export type {
  Exercise,
  ExerciseAnswer,
  ExerciseAttempt,
  ExerciseEvaluation,
  ExerciseOption,
  ExerciseStep,
  ExerciseType,
  NumericAnswer
} from "./models/exercise";
export { exerciseTypes } from "./models/exercise";
export type { Lesson, LessonContent } from "./models/lesson";
export type { ProgressStatus, UserProgress } from "./models/progress";
export { evaluateExerciseAttempt } from "./exercises/evaluateExerciseAttempt";
export * as learning from "./learning";
export type {
  Attempt,
  Course as LearningCourse,
  LearningContent,
  EvaluationResult,
  LearningExercise,
  LearningExerciseType,
  LearningSafeParseResult,
  LearningStatus,
  LearningValidationIssue,
  Lesson as LearningLesson,
  LessonStep,
  LessonStepType,
  Level,
  ProgressSummary,
  Step,
  StepType,
  Subject
} from "./learning";
export {
  calculateCompletionPercent,
  calculateCourseProgressSummary,
  calculateCourseStatus,
  calculateLessonProgressSummary,
  calculateLessonStatus,
  calculateLevelProgressSummary,
  calculateLevelStatus,
  evaluateLearningExercise,
  evaluateMultipleChoiceExercise,
  evaluateNumericInputExercise,
  isLessonUnlocked,
  learningExerciseTypes,
  LearningContentValidationError,
  learningStatuses,
  lessonStepTypes,
  parseCourse,
  parseLearningContent,
  parseLearningExercise,
  parseLesson,
  parseLessonStep,
  parseLevel,
  parseSubject,
  safeParseCourse,
  safeParseLearningContent,
  safeParseLearningExercise,
  safeParseLesson,
  safeParseLessonStep,
  safeParseLevel,
  safeParseSubject,
  validateCourse,
  validateLearningContent,
  validateLearningExercise,
  validateLesson,
  validateLessonStep,
  validateLevel,
  validateSubject
} from "./learning";
