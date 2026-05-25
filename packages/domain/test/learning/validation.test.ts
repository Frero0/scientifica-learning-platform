import { describe, expect, it } from "vitest";

import {
  LearningContentValidationError,
  parseLearningContent,
  parseLearningExercise,
  parseLesson,
  safeParseLearningContent,
  safeParseLearningExercise,
  validateLesson
} from "../../src/learning";
import type { Lesson, Subject } from "../../src/learning";

function buildValidLesson(): Lesson {
  return {
    id: "lesson-observation",
    levelId: "level-observe",
    slug: "observe-before-explaining",
    title: "Observe before explaining",
    summary: "Separate observations from explanations.",
    durationMinutes: 12,
    order: 1,
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "Goal",
        order: 1,
        body: "Start from what can be measured."
      },
      {
        id: "concept",
        type: "concept",
        title: "Observation",
        order: 2,
        body: "An observation describes evidence before explaining causes."
      },
      {
        id: "visual-model",
        type: "visual_model",
        title: "Pendulum model",
        order: 3,
        metadata: {
          model: "pendulum-period"
        },
        body: "Compare two pendulum trials by their measured period."
      },
      {
        id: "exercise-choice",
        type: "exercise",
        title: "Pick evidence",
        order: 4,
        exercise: {
          id: "exercise-choice",
          type: "multiple_choice",
          prompt: "Which statement is an observation?",
          options: [
            { id: "a", label: "The period increased.", value: "period-increased" },
            { id: "b", label: "Gravity changed.", value: "gravity-changed" }
          ],
          correctAnswer: "period-increased",
          points: 5,
          explanation: "The period is a measured result."
        }
      },
      {
        id: "exercise-numeric",
        type: "exercise",
        title: "Estimate period",
        order: 5,
        exercise: {
          id: "exercise-numeric",
          type: "numeric_input",
          prompt: "What is the period in seconds?",
          correctAnswer: {
            value: 1.2,
            tolerance: 0.1
          },
          points: 5,
          unit: "s"
        }
      },
      {
        id: "exercise-steps",
        type: "exercise",
        title: "Build a claim",
        order: 6,
        exercise: {
          id: "exercise-steps",
          type: "step_by_step",
          prompt: "Use evidence to build a claim.",
          steps: [
            {
              id: "step-1",
              prompt: "Name the measurement.",
              expectedAnswer: "period",
              hint: "Look at what was timed."
            }
          ],
          points: 10
        }
      },
      {
        id: "reflection",
        type: "reflection",
        title: "Predict",
        order: 7,
        body: "What would you measure next?"
      },
      {
        id: "summary",
        type: "summary",
        title: "Key idea",
        order: 8,
        body: "Evidence comes before explanation."
      },
      {
        id: "completion",
        type: "completion",
        title: "Complete",
        order: 9,
        body: "Continue to describing variables."
      }
    ]
  };
}

function buildValidSubject(): Subject {
  return {
    id: "subject-scientific-thinking",
    slug: "scientific-thinking",
    title: "Scientific Thinking",
    summary: "Learn how scientific reasoning works.",
    color: "#2563eb",
    icon: "microscope",
    order: 1,
    courses: [
      {
        id: "course-foundations",
        subjectId: "subject-scientific-thinking",
        slug: "foundations",
        title: "Foundations of Scientific Thinking",
        summary: "Build a reliable reasoning workflow.",
        estimatedMinutes: 45,
        order: 1,
        levels: [
          {
            id: "level-observe",
            courseId: "course-foundations",
            slug: "observe-and-describe",
            title: "Observe and describe",
            order: 1,
            lessons: [buildValidLesson()]
          }
        ]
      }
    ]
  };
}

describe("learning content validation", () => {
  it("parses valid learning content through Subject -> Course -> Level -> Lesson -> Step", () => {
    const content = buildValidSubject();

    expect(parseLearningContent(content)).toBe(content);
    expect(safeParseLearningContent(content)).toEqual({
      success: true,
      data: content
    });
  });

  it("parses a lesson with the MVP step and exercise types", () => {
    const lesson = buildValidLesson();
    const stepByStepStep = lesson.steps[5];

    expect(parseLesson(lesson)).toBe(lesson);
    expect(stepByStepStep?.type).toBe("exercise");

    if (stepByStepStep?.type !== "exercise") {
      throw new Error("Expected exercise step fixture.");
    }

    expect(parseLearningExercise(stepByStepStep.exercise)).toEqual({
      id: "exercise-steps",
      type: "step_by_step",
      prompt: "Use evidence to build a claim.",
      steps: [
        {
          id: "step-1",
          prompt: "Name the measurement.",
          expectedAnswer: "period",
          hint: "Look at what was timed."
        }
      ],
      points: 10
    });
  });

  it("reports readable nested errors for malformed content", () => {
    const invalid = buildValidSubject();
    const lesson = invalid.courses?.[0]?.levels[0]?.lessons[0];

    if (
      lesson?.steps[3]?.type === "exercise" &&
      lesson.steps[3].exercise.type === "multiple_choice"
    ) {
      lesson.steps[3].exercise.correctAnswer = "not-an-option";
    }

    const result = safeParseLearningContent(invalid);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(LearningContentValidationError);
      expect(result.error.issues).toContainEqual({
        path: "courses[0].levels[0].lessons[0].steps[3].exercise.correctAnswer",
        message: "Expected answer to match an option value."
      });
      expect(result.error.message).toContain(
        "courses[0].levels[0].lessons[0].steps[3].exercise.correctAnswer"
      );
    }
  });

  it("rejects lessons without an action step", () => {
    const lesson = {
      ...buildValidLesson(),
      steps: [
        {
          id: "summary-only",
          type: "summary",
          title: "Summary",
          order: 1,
          body: "No action for the learner."
        }
      ]
    };

    expect(validateLesson(lesson)).toContainEqual({
      path: "steps",
      message: "Expected at least one action step of type exercise or reflection."
    });
  });

  it("requires structural child arrays in the learning hierarchy", () => {
    const result = safeParseLearningContent({
      id: "subject",
      slug: "subject",
      title: "Subject",
      order: 1,
      courses: [
        {
          id: "course",
          slug: "course",
          title: "Course",
          summary: "Course summary.",
          order: 1
        }
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual({
        path: "courses[0].levels",
        message: "Expected array."
      });
    }
  });

  it("does not accept future exercise types in the MVP schema yet", () => {
    const result = safeParseLearningExercise({
      id: "exercise-simulation",
      type: "simulation",
      prompt: "Tune the pendulum and observe the period.",
      points: 10
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual({
        path: "type",
        message:
          "Expected one of: multiple_choice, numeric_input, step_by_step. Future exercise types are documented but not accepted by the MVP schema yet."
      });
    }
  });
});
