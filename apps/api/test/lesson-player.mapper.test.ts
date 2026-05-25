import { describe, expect, it } from "vitest";

import {
  mapLessonToLessonPlayerDto,
  type LessonPlayerMapperLesson
} from "../src/modules/lessons/lesson-player.mapper";

const baseLesson: LessonPlayerMapperLesson = {
  id: "lesson-1",
  moduleId: "level-1",
  slug: "observation",
  title: "Observation",
  summary: "Separate observation from explanation.",
  durationMinutes: 12,
  order: 1,
  module: {
    id: "level-1",
    title: "Thinking Like a Scientist",
    order: 1,
    course: {
      id: "course-1",
      slug: "scientific-thinking",
      title: "Scientific Thinking"
    }
  },
  content: {
    introduction: "Observe before explaining.",
    keyIdeas: ["Observation describes what changed.", "Evidence needs isolated variables."],
    visualExplanation: {
      title: "Pendulum model",
      description: "Length changes the period.",
      variables: [
        {
          symbol: "L",
          label: "length"
        }
      ]
    }
  },
  exercises: [
    {
      id: "exercise-2",
      lessonId: "lesson-1",
      type: "NUMERIC_INPUT",
      prompt: "Estimate the period.",
      options: {
        unit: "s"
      },
      points: 15,
      order: 2
    },
    {
      id: "exercise-1",
      lessonId: "lesson-1",
      type: "MULTIPLE_CHOICE",
      prompt: "Which sentence is an observation?",
      explanation: "Observation reports what changed.",
      options: [
        {
          id: "a",
          label: "The period increased.",
          value: "period-increased"
        }
      ],
      points: 10,
      order: 1
    },
    {
      id: "exercise-3",
      lessonId: "lesson-1",
      type: "STEP_BY_STEP",
      prompt: "Build a hypothesis.",
      explanation: "A useful hypothesis connects a variable to a prediction.",
      steps: [
        {
          id: "step-variable",
          title: "Variable",
          prompt: "Identify the changed variable.",
          expectedAnswer: "length",
          hint: "It is the part you changed."
        }
      ],
      points: 20,
      order: 3
    }
  ]
};

describe("mapLessonToLessonPlayerDto", () => {
  it("maps a legacy lesson into stable player step order", () => {
    const dto = mapLessonToLessonPlayerDto(baseLesson);

    expect(dto).toMatchObject({
      id: "lesson-1",
      slug: "observation",
      course: {
        id: "course-1",
        slug: "scientific-thinking"
      },
      level: {
        id: "level-1",
        title: "Thinking Like a Scientist"
      }
    });
    expect(dto.steps.map((step) => [step.id, step.type, step.order])).toEqual([
      ["lesson-1-intro", "content", 1],
      ["lesson-1-concepts", "content", 2],
      ["lesson-1-visual-model", "content", 3],
      ["exercise-exercise-1", "quiz", 4],
      ["exercise-exercise-2", "exercise", 5],
      ["exercise-exercise-3", "exercise", 6]
    ]);
  });

  it("keeps the public discriminated union explicit and excludes private answers", () => {
    const dto = mapLessonToLessonPlayerDto(baseLesson);
    const contentStep = dto.steps[0];
    const quizStep = dto.steps[3];
    const numericStep = dto.steps[4];
    const stepByStepStep = dto.steps[5];

    expect(contentStep).toMatchObject({
      type: "content",
      content: {
        kind: "intro",
        body: "Observe before explaining."
      }
    });
    expect(quizStep).toMatchObject({
      type: "quiz",
      quiz: {
        id: "exercise-1",
        exerciseType: "multiple_choice",
        options: [
          {
            id: "a",
            label: "The period increased.",
            value: "period-increased"
          }
        ]
      }
    });
    expect(numericStep).toMatchObject({
      type: "exercise",
      exercise: {
        id: "exercise-2",
        exerciseType: "numeric_input",
        unit: "s"
      }
    });
    expect(stepByStepStep).toMatchObject({
      type: "exercise",
      exercise: {
        id: "exercise-3",
        exerciseType: "step_by_step",
        steps: [
          {
            id: "step-variable",
            title: "Variable",
            prompt: "Identify the changed variable.",
            hint: "It is the part you changed."
          }
        ]
      }
    });
    expect(JSON.stringify(dto)).not.toContain("expectedAnswer");
    expect(JSON.stringify(dto)).not.toContain("correctAnswer");
  });

  it("uses LessonContentV2.steps and appends unreferenced persisted exercises", () => {
    const dto = mapLessonToLessonPlayerDto({
      ...baseLesson,
      content: {
        version: 2,
        steps: [
          {
            id: "intro-step",
            type: "intro",
            title: "Start",
            order: 1,
            body: "Start from an observation."
          },
          {
            id: "quiz-step",
            type: "exercise",
            exerciseId: "exercise-1",
            order: 2,
            progressiveHints: ["Read only what changed."]
          },
          {
            id: "summary-step",
            type: "summary",
            order: 4,
            body: "Evidence supports or rejects hypotheses."
          }
        ]
      }
    });

    expect(dto.steps.map((step) => [step.id, step.type, step.order])).toEqual([
      ["intro-step", "content", 1],
      ["quiz-step", "quiz", 2],
      ["summary-step", "content", 4],
      ["exercise-exercise-2", "exercise", 5],
      ["exercise-exercise-3", "exercise", 6]
    ]);
    expect(dto.steps[1]).toMatchObject({
      type: "quiz",
      quiz: {
        hints: [
          {
            id: "hint-1",
            body: "Read only what changed."
          }
        ]
      }
    });
  });

  it("projects minimal lesson progress and exercise state", () => {
    const dto = mapLessonToLessonPlayerDto(baseLesson, {
      lessonProgress: {
        lessonId: "lesson-1",
        completedExercises: 1,
        totalExercises: 3,
        percent: 33,
        status: "IN_PROGRESS",
        lastExerciseId: "exercise-2"
      },
      completedExerciseIds: ["exercise-1"],
      attemptedExerciseIds: ["exercise-1", "exercise-2"]
    });

    expect(dto.progress).toMatchObject({
      completed: false,
      currentStepId: "exercise-exercise-2",
      completedStepIds: [
        "lesson-1-intro",
        "lesson-1-concepts",
        "lesson-1-visual-model",
        "exercise-exercise-1"
      ],
      completedCount: 1,
      totalCount: 3,
      percent: 33,
      status: "in_progress",
      exercises: [
        {
          exerciseId: "exercise-1",
          stepId: "exercise-exercise-1",
          status: "completed",
          result: "success"
        },
        {
          exerciseId: "exercise-2",
          stepId: "exercise-exercise-2",
          status: "attempted",
          result: "failure"
        },
        {
          exerciseId: "exercise-3",
          stepId: "exercise-exercise-3",
          status: "not_started"
        }
      ]
    });
    expect(dto.steps[4]?.progress).toMatchObject({
      current: true,
      locked: false,
      status: "in_progress"
    });
    expect(dto.steps[5]?.progress).toMatchObject({
      current: false,
      locked: true,
      status: "locked"
    });
  });

  it("does not treat a persisted not_started progress row as started activity", () => {
    const dto = mapLessonToLessonPlayerDto(baseLesson, {
      lessonProgress: {
        lessonId: "lesson-1",
        completedExercises: 0,
        totalExercises: 3,
        percent: 0,
        status: "NOT_STARTED",
        lastExerciseId: null
      }
    });

    expect(dto.progress).toMatchObject({
      completed: false,
      currentStepId: "lesson-1-intro",
      completedStepIds: [],
      completedCount: 0,
      totalCount: 3,
      percent: 0,
      status: "available"
    });
  });

  it("maps future interactive exercise families without requiring a rendering engine", () => {
    const dto = mapLessonToLessonPlayerDto({
      ...baseLesson,
      content: {
        version: 2,
        steps: [
          {
            id: "interactive-step",
            type: "exercise",
            exerciseId: "interactive-1",
            order: 1
          }
        ]
      },
      exercises: [
        {
          id: "interactive-1",
          lessonId: "lesson-1",
          type: "INTERACTIVE_VISUALIZATION",
          prompt: "Explore how length changes period.",
          visual: {
            model: "pendulum"
          },
          points: 0,
          order: 1
        }
      ]
    });

    expect(dto.steps).toEqual([
      expect.objectContaining({
        id: "interactive-step",
        type: "interactive",
        interactive: expect.objectContaining({
          id: "interactive-1",
          exerciseType: "interactive_visualization",
          visualization: {
            model: "pendulum"
          }
        })
      })
    ]);
  });
});
