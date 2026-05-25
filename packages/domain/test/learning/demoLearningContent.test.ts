import { describe, expect, it } from "vitest";

import {
  calculateCourseProgressSummary,
  calculateLessonProgressSummary,
  evaluateMultipleChoiceExercise,
  evaluateNumericInputExercise,
  parseLearningContent,
  safeParseLearningContent
} from "../../src/learning";
import type { ExerciseLessonStep, LessonStep } from "../../src/learning";
import { demoLearningContent } from "./fixtures/demoLearningContent";

function getExerciseStep(step: LessonStep | undefined): ExerciseLessonStep {
  if (step?.type !== "exercise") {
    throw new Error("Expected fixture step to be an exercise.");
  }

  return step;
}

describe("demo learning content fixture", () => {
  it("parses the Math equation path through the learning content model", () => {
    const parsed = parseLearningContent(demoLearningContent);
    const result = safeParseLearningContent(demoLearningContent);

    expect(parsed).toBe(demoLearningContent);
    expect(result).toEqual({
      success: true,
      data: demoLearningContent
    });
    expect(demoLearningContent.courses).toHaveLength(1);
    expect(demoLearningContent.courses?.[0]?.levels).toHaveLength(2);
    expect(demoLearningContent.courses?.[0]?.levels.flatMap((level) => level.lessons)).toHaveLength(
      3
    );
  });

  it("evaluates multiple choice and numeric input exercises from the fixture", () => {
    const firstLesson = demoLearningContent.courses?.[0]?.levels[0]?.lessons[0];
    const secondLesson = demoLearningContent.courses?.[0]?.levels[0]?.lessons[1];
    const multipleChoiceStep = getExerciseStep(firstLesson?.steps[3]);
    const numericStep = getExerciseStep(secondLesson?.steps[2]);

    expect(multipleChoiceStep.exercise.type).toBe("multiple_choice");
    expect(numericStep.exercise.type).toBe("numeric_input");

    if (
      multipleChoiceStep.exercise.type !== "multiple_choice" ||
      numericStep.exercise.type !== "numeric_input"
    ) {
      throw new Error("Expected fixture exercise types.");
    }

    expect(
      evaluateMultipleChoiceExercise(multipleChoiceStep.exercise, " X-PLUS-3-EQUALS-7 ")
    ).toEqual({
      correct: true,
      score: 5,
      maxScore: 5,
      feedback: "An equation includes an equals sign between two expressions."
    });

    expect(evaluateNumericInputExercise(numericStep.exercise, "4")).toEqual({
      correct: true,
      score: 6,
      maxScore: 6,
      feedback: "Substituting 4 gives 4 + 3 = 7."
    });
  });

  it("calculates progress over lessons and the course from fixture activity", () => {
    const course = demoLearningContent.courses?.[0];
    const firstLesson = course?.levels[0]?.lessons[0];
    const secondLesson = course?.levels[0]?.lessons[1];

    if (!course || !firstLesson || !secondLesson) {
      throw new Error("Expected complete course fixture.");
    }

    expect(
      calculateLessonProgressSummary(firstLesson, {
        completedExerciseIds: ["exercise-spot-equation"]
      })
    ).toEqual({
      completedCount: 1,
      totalCount: 1,
      percent: 100,
      status: "completed"
    });

    expect(
      calculateLessonProgressSummary(secondLesson, {
        attemptedExerciseIds: ["exercise-balance-numeric"]
      })
    ).toEqual({
      completedCount: 0,
      totalCount: 1,
      percent: 0,
      status: "in_progress"
    });

    expect(
      calculateCourseProgressSummary(course, {
        completedLessonIds: ["lesson-what-is-an-equation", "lesson-balance-model"]
      })
    ).toEqual({
      completedCount: 1,
      totalCount: 2,
      percent: 50,
      status: "in_progress"
    });
  });
});
