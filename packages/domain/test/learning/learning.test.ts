import { describe, expect, it } from "vitest";

import {
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
  isLessonUnlocked
} from "../../src/learning";
import type { Course, Lesson, Level } from "../../src/learning";

const firstLesson: Lesson = {
  id: "lesson-1",
  levelId: "level-1",
  slug: "observe",
  title: "Observe",
  summary: "Observe before explaining.",
  durationMinutes: 8,
  order: 1,
  steps: [
    {
      id: "intro-1",
      type: "intro",
      title: "Goal",
      order: 1,
      body: "Learn to separate observations from claims."
    },
    {
      id: "exercise-step-1",
      type: "exercise",
      title: "Observation check",
      order: 2,
      exercise: {
        id: "exercise-1",
        type: "multiple_choice",
        prompt: "Pick the observation.",
        options: [
          { id: "a", label: "The period got longer.", value: "period-longer" },
          { id: "b", label: "Gravity became weaker.", value: "gravity-weaker" }
        ],
        correctAnswer: "period-longer",
        points: 10
      }
    }
  ]
};

const secondLesson: Lesson = {
  ...firstLesson,
  id: "lesson-2",
  slug: "describe",
  title: "Describe",
  order: 2,
  prerequisites: ["lesson-1"],
  steps: [
    {
      id: "exercise-step-2",
      type: "exercise",
      title: "Numeric check",
      order: 1,
      exercise: {
        id: "exercise-2",
        type: "numeric_input",
        prompt: "How many trials?",
        correctAnswer: {
          value: 3,
          tolerance: 0
        },
        points: 5
      }
    }
  ]
};

const level: Level = {
  id: "level-1",
  courseId: "course-1",
  slug: "observe-and-describe",
  title: "Observe and describe",
  order: 1,
  lessons: [firstLesson, secondLesson]
};

const course: Course = {
  id: "course-1",
  subjectId: "subject-1",
  slug: "scientific-thinking",
  title: "Scientific Thinking",
  summary: "Build the foundations of scientific reasoning.",
  order: 1,
  levels: [level]
};

describe("learning progress", () => {
  it("calculates bounded completion percentages", () => {
    expect(calculateCompletionPercent(1, 4)).toBe(25);
    expect(calculateCompletionPercent(5, 4)).toBe(100);
    expect(calculateCompletionPercent(1, 0)).toBe(0);
  });

  it("determines whether a lesson is unlocked from prerequisites and previous lesson", () => {
    expect(isLessonUnlocked(firstLesson)).toBe(true);
    expect(
      isLessonUnlocked(secondLesson, {
        previousLesson: firstLesson,
        completedLessonIds: []
      })
    ).toBe(false);
    expect(
      isLessonUnlocked(secondLesson, {
        previousLesson: firstLesson,
        completedLessonIds: ["lesson-1"]
      })
    ).toBe(true);
  });

  it("calculates lesson status from unlock, activity, and required exercises", () => {
    expect(calculateLessonStatus(firstLesson, { unlocked: false })).toBe("locked");
    expect(calculateLessonStatus(firstLesson)).toBe("available");
    expect(calculateLessonStatus(firstLesson, { attemptedExerciseIds: ["exercise-1"] })).toBe(
      "in_progress"
    );
    expect(calculateLessonStatus(firstLesson, { completedExerciseIds: ["exercise-1"] })).toBe(
      "completed"
    );
  });

  it("summarizes lesson completion against required exercise steps", () => {
    expect(
      calculateLessonProgressSummary(firstLesson, {
        completedExerciseIds: ["exercise-1"]
      })
    ).toEqual({
      completedCount: 1,
      totalCount: 1,
      percent: 100,
      status: "completed"
    });
  });

  it("calculates level and course status from child completion", () => {
    expect(calculateLevelStatus(level)).toBe("available");
    expect(calculateLevelStatus(level, { completedLessonIds: ["lesson-1"] })).toBe("in_progress");
    expect(calculateLevelStatus(level, { completedLessonIds: ["lesson-1", "lesson-2"] })).toBe(
      "completed"
    );

    expect(calculateCourseStatus(course)).toBe("available");
    expect(calculateCourseStatus(course, { completedLessonIds: ["lesson-1"] })).toBe(
      "in_progress"
    );
    expect(calculateCourseStatus(course, { completedLessonIds: ["lesson-1", "lesson-2"] })).toBe(
      "completed"
    );
    expect(calculateCourseStatus(course, { completedLevelIds: ["level-1"] })).toBe("completed");
  });

  it("summarizes level and course progress", () => {
    expect(calculateLevelProgressSummary(level, { completedLessonIds: ["lesson-1"] })).toEqual({
      completedCount: 1,
      totalCount: 2,
      percent: 50,
      status: "in_progress"
    });

    expect(calculateCourseProgressSummary(course, { completedLevelIds: ["level-1"] })).toEqual({
      completedCount: 1,
      totalCount: 1,
      percent: 100,
      status: "completed"
    });

    expect(
      calculateCourseProgressSummary(course, { completedLessonIds: ["lesson-1", "lesson-2"] })
    ).toEqual({
      completedCount: 1,
      totalCount: 1,
      percent: 100,
      status: "completed"
    });
  });
});

describe("learning exercise evaluation", () => {
  it("evaluates multiple choice answers with normalization and order-insensitive arrays", () => {
    const result = evaluateMultipleChoiceExercise({
      id: "exercise-mc",
      type: "multiple_choice",
      prompt: "Choose the measured variables.",
      options: [
        { id: "a", label: "Length", value: "length" },
        { id: "b", label: "Mass", value: "mass" },
        { id: "c", label: "Color", value: "color" }
      ],
      correctAnswer: ["length", "mass"],
      points: 10,
      explanation: "Length and mass are measured directly."
    }, [" MASS ", "length"]);

    expect(result).toEqual({
      correct: true,
      score: 10,
      maxScore: 10,
      feedback: "Length and mass are measured directly."
    });
  });

  it("evaluates numeric input with tolerance", () => {
    const result = evaluateNumericInputExercise({
      id: "exercise-num",
      type: "numeric_input",
      prompt: "Estimate g.",
      correctAnswer: {
        value: 9.8,
        tolerance: 0.2
      },
      points: 12,
      unit: "m/s^2"
    }, "9.9");

    expect(result).toEqual({
      correct: true,
      score: 12,
      maxScore: 12,
      feedback: "Correct."
    });
  });

  it("returns expected answer for an incorrect exercise answer", () => {
    const result = evaluateLearningExercise({
      id: "exercise-num",
      type: "numeric_input",
      prompt: "Estimate g.",
      correctAnswer: 9.8,
      points: 12
    }, "11");

    expect(result).toMatchObject({
      correct: false,
      score: 0,
      maxScore: 12,
      expectedAnswer: 9.8
    });
  });
});
