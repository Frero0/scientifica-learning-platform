import { describe, expect, it } from "vitest";

import {
  mapCourseToCoursePathDto,
  type CoursePathMapperCourse
} from "../src/modules/courses/course-path.mapper";

const baseCourse: CoursePathMapperCourse = {
  id: "course-1",
  slug: "scientific-thinking",
  title: "Scientific Thinking",
  summary: "Learn scientific reasoning.",
  description: "A course about observation and evidence.",
  difficulty: "beginner",
  estimatedMinutes: 45,
  modules: [
    {
      id: "level-2",
      courseId: "course-1",
      title: "Second Level",
      description: "Locked until level one is complete.",
      order: 2,
      lessons: [
        {
          id: "lesson-2",
          moduleId: "level-2",
          slug: "later-lesson",
          title: "Later lesson",
          summary: "A later lesson.",
          durationMinutes: 8,
          order: 1,
          content: {
            introduction: "Later intro."
          },
          exercises: []
        }
      ]
    },
    {
      id: "level-1",
      courseId: "course-1",
      title: "First Level",
      description: "Start here.",
      order: 1,
      lessons: [
        {
          id: "lesson-1",
          moduleId: "level-1",
          slug: "observation",
          title: "Observation",
          summary: "Separate observation from explanation.",
          durationMinutes: 12,
          order: 2,
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
            }
          ]
        },
        {
          id: "lesson-0",
          moduleId: "level-1",
          slug: "first-lesson",
          title: "First lesson",
          summary: "The first lesson.",
          durationMinutes: 5,
          order: 1,
          content: {
            introduction: "Start."
          },
          exercises: []
        }
      ]
    }
  ]
};

describe("mapCourseToCoursePathDto", () => {
  it("maps Course -> Level -> Lesson -> Step in stable order", () => {
    const dto = mapCourseToCoursePathDto(baseCourse);

    expect(dto.levels.map((level) => level.id)).toEqual(["level-1", "level-2"]);
    expect(dto.levels[0]?.lessons.map((lesson) => lesson.id)).toEqual(["lesson-0", "lesson-1"]);

    const steps = dto.levels[0]?.lessons[1]?.steps;

    expect(steps?.map((step) => step.type)).toEqual([
      "intro",
      "concept",
      "visual_model",
      "exercise",
      "exercise"
    ]);
    expect(steps?.map((step) => step.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("includes evaluable exercises as exercise steps without private answers", () => {
    const dto = mapCourseToCoursePathDto(baseCourse);
    const exerciseSteps = dto.levels[0]?.lessons[1]?.steps.filter(
      (step) => step.type === "exercise"
    );

    expect(exerciseSteps).toHaveLength(2);
    expect(exerciseSteps?.[0]).toMatchObject({
      type: "exercise",
      exercise: {
        id: "exercise-1",
        type: "multiple_choice",
        prompt: "Which sentence is an observation?",
        options: [
          {
            id: "a",
            label: "The period increased.",
            value: "period-increased"
          }
        ],
        points: 10
      }
    });
    expect(exerciseSteps?.[0]?.exercise).not.toHaveProperty("correctAnswer");
  });

  it("derives non-evaluable steps from Lesson.content version 2 when present", () => {
    const dto = mapCourseToCoursePathDto({
      ...baseCourse,
      modules: [
        {
          ...baseCourse.modules[0]!,
          order: 1,
          lessons: [
            {
              id: "lesson-v2",
              moduleId: "level-2",
              slug: "content-v2",
              title: "Content v2",
              summary: "Structured content.",
              durationMinutes: 10,
              order: 1,
              content: {
                version: 2,
                steps: [
                  {
                    id: "intro-step",
                    type: "intro",
                    title: "Intro",
                    order: 1,
                    body: "Start from an observation."
                  },
                  {
                    id: "exercise-step",
                    type: "exercise",
                    exerciseId: "exercise-v2",
                    order: 2
                  },
                  {
                    id: "summary-step",
                    type: "summary",
                    order: 3,
                    body: "Evidence supports or rejects hypotheses."
                  }
                ]
              },
              exercises: [
                {
                  id: "exercise-v2",
                  lessonId: "lesson-v2",
                  type: "STEP_BY_STEP",
                  prompt: "Build a hypothesis.",
                  steps: [
                    {
                      id: "step-variable",
                      title: "Variable",
                      prompt: "Identify the variable.",
                      expectedAnswer: "length",
                      hint: "It is the changed part."
                    }
                  ],
                  points: 20,
                  order: 1
                }
              ]
            }
          ]
        }
      ]
    });

    const steps = dto.levels[0]?.lessons[0]?.steps;

    expect(steps?.map((step) => [step.id, step.type, step.order])).toEqual([
      ["intro-step", "intro", 1],
      ["exercise-step", "exercise", 2],
      ["summary-step", "summary", 3]
    ]);
    expect(steps?.[1]).toMatchObject({
      type: "exercise",
      exercise: {
        id: "exercise-v2",
        type: "step_by_step",
        steps: [
          {
            id: "step-variable",
            prompt: "Identify the variable.",
            hint: "It is the changed part."
          }
        ]
      }
    });
  });

  it("projects lesson and exercise progress when user progress is provided", () => {
    const dto = mapCourseToCoursePathDto(baseCourse, {
      lessonProgress: [
        {
          lessonId: "lesson-1",
          completedExercises: 1,
          totalExercises: 2,
          percent: 50,
          status: "IN_PROGRESS"
        }
      ],
      completedExerciseIds: ["exercise-1"],
      attemptedExerciseIds: ["exercise-1", "exercise-2"]
    });
    const lesson = dto.levels[0]?.lessons[1];
    const exerciseSteps = lesson?.steps.filter((step) => step.type === "exercise");

    expect(lesson?.progress).toMatchObject({
      completedCount: 1,
      totalCount: 2,
      percent: 50,
      status: "in_progress"
    });
    expect(exerciseSteps?.[0]?.progress.status).toBe("completed");
    expect(exerciseSteps?.[1]?.progress.status).toBe("in_progress");
  });
});
