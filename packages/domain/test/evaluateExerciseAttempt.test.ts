import { describe, expect, it } from "vitest";

import { evaluateExerciseAttempt } from "../src/exercises/evaluateExerciseAttempt";
import type { Exercise } from "../src/models/exercise";

const baseExercise: Exercise = {
  id: "exercise-1",
  lessonId: "lesson-1",
  type: "multiple_choice",
  prompt: "Pick the observation.",
  explanation: "The answer reports the observation without adding a cause.",
  correctAnswer: "longer-period-observation",
  points: 10,
  order: 1
};

describe("evaluateExerciseAttempt", () => {
  it("marks a normalized multiple choice answer as correct and awards full points", () => {
    const result = evaluateExerciseAttempt(baseExercise, "  LONGER-PERIOD-OBSERVATION  ");

    expect(result).toEqual({
      correct: true,
      score: 10,
      feedback: baseExercise.explanation
    });
    expect(result).not.toHaveProperty("expectedAnswer");
  });

  it("marks an incorrect answer as wrong, with zero score and expected answer", () => {
    const result = evaluateExerciseAttempt(baseExercise, "energy-claim");

    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedback).toContain("Not quite");
    expect(result.expectedAnswer).toBe("longer-period-observation");
  });

  it("accepts numeric answers inside the configured tolerance", () => {
    const exercise: Exercise = {
      ...baseExercise,
      type: "numeric_input",
      correctAnswer: {
        value: 2,
        tolerance: 0.15
      },
      points: 15
    };

    const result = evaluateExerciseAttempt(exercise, "2.1");

    expect(result.correct).toBe(true);
    expect(result.score).toBe(15);
  });

  it("rejects invalid numeric input without awarding points", () => {
    const exercise: Exercise = {
      ...baseExercise,
      type: "numeric_input",
      correctAnswer: {
        value: 2,
        tolerance: 0.15
      },
      points: 15
    };

    const result = evaluateExerciseAttempt(exercise, "not-a-number");

    expect(result).toMatchObject({
      correct: false,
      score: 0,
      expectedAnswer: {
        value: 2,
        tolerance: 0.15
      }
    });
  });

  it("evaluates step-by-step answers against expected step values", () => {
    const exercise: Exercise = {
      ...baseExercise,
      type: "step_by_step",
      correctAnswer: {
        steps: ["length", "period increases"]
      },
      steps: [
        {
          id: "step-variable",
          title: "Variable",
          prompt: "Identify the changed variable.",
          expectedAnswer: "length"
        },
        {
          id: "step-prediction",
          title: "Prediction",
          prompt: "Predict the period change.",
          expectedAnswer: "period increases"
        }
      ],
      points: 20
    };

    const result = evaluateExerciseAttempt(exercise, {
      steps: ["length", "period increases"]
    });

    expect(result.correct).toBe(true);
    expect(result.score).toBe(20);
  });
});
