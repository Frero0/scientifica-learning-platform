import type { Subject } from "../../../src/learning";

export const demoLearningContent = {
  id: "subject-math",
  slug: "math",
  title: "Math",
  summary: "Build practical algebra skills from visual reasoning to symbolic solving.",
  description: "A compact MVP path for learning how equations work and how to solve them.",
  color: "#0f766e",
  icon: "calculator",
  order: 1,
  courses: [
    {
      id: "course-solving-equations",
      subjectId: "subject-math",
      slug: "solving-equations",
      title: "Solving Equations",
      summary: "Understand equations as balanced statements and solve simple unknowns.",
      description: "Learners move from the meaning of equality to substitution-based solving.",
      estimatedMinutes: 34,
      order: 1,
      levels: [
        {
          id: "level-equations-introduction",
          courseId: "course-solving-equations",
          slug: "introduction",
          title: "Introduction",
          summary: "Recognize equations and reason with balance.",
          order: 1,
          lessons: [
            {
              id: "lesson-what-is-an-equation",
              levelId: "level-equations-introduction",
              slug: "what-is-an-equation",
              title: "What is an equation?",
              summary: "Learn that an equation says two expressions have the same value.",
              durationMinutes: 10,
              order: 1,
              steps: [
                {
                  id: "step-equation-intro",
                  lessonId: "lesson-what-is-an-equation",
                  type: "intro",
                  title: "Goal",
                  order: 1,
                  body: "An equation is a statement that two quantities are equal."
                },
                {
                  id: "step-equation-concept",
                  lessonId: "lesson-what-is-an-equation",
                  type: "concept",
                  title: "Equality",
                  order: 2,
                  body: "The equals sign means the left side and right side have the same value.",
                  metadata: {
                    progressiveHints: [
                      "Read both sides of the equals sign.",
                      "Ask whether the two sides can have the same value.",
                      "Replace the unknown with a possible value and check both sides."
                    ],
                    feedback: {
                      correct: "You treated the equals sign as a balance.",
                      incorrect: "Focus on whether both sides can represent the same value."
                    }
                  }
                },
                {
                  id: "step-equation-visual",
                  lessonId: "lesson-what-is-an-equation",
                  type: "visual_model",
                  title: "Balance picture",
                  order: 3,
                  body: "Imagine a scale with one expression on each pan.",
                  metadata: {
                    model: "balance-scale",
                    left: "x + 3",
                    right: "7"
                  }
                },
                {
                  id: "step-equation-choice",
                  lessonId: "lesson-what-is-an-equation",
                  type: "exercise",
                  title: "Spot the equation",
                  order: 4,
                  exercise: {
                    id: "exercise-spot-equation",
                    type: "multiple_choice",
                    prompt: "Which statement is an equation?",
                    options: [
                      { id: "a", label: "x + 3 = 7", value: "x-plus-3-equals-7" },
                      { id: "b", label: "x + 3", value: "x-plus-3" },
                      { id: "c", label: "Add 3 to x", value: "add-3-to-x" }
                    ],
                    correctAnswer: "x-plus-3-equals-7",
                    points: 5,
                    explanation: "An equation includes an equals sign between two expressions."
                  },
                  metadata: {
                    progressiveHints: [
                      "Look for a full statement, not only an expression.",
                      "An equation must compare two sides.",
                      "The equals sign is the key signal."
                    ],
                    feedback: {
                      correct: "Correct. x + 3 = 7 states that two expressions are equal.",
                      incorrect: "Not quite. Pick the option with an equals sign."
                    }
                  }
                },
                {
                  id: "step-equation-reflection",
                  lessonId: "lesson-what-is-an-equation",
                  type: "reflection",
                  title: "Reflect",
                  order: 5,
                  body: "Why is x + 3 not an equation by itself?"
                },
                {
                  id: "step-equation-summary",
                  lessonId: "lesson-what-is-an-equation",
                  type: "summary",
                  title: "Key idea",
                  order: 6,
                  body: "An equation is balanced when both sides have the same value."
                },
                {
                  id: "step-equation-completion",
                  lessonId: "lesson-what-is-an-equation",
                  type: "completion",
                  title: "Complete",
                  order: 7,
                  body: "Next, use the balance model to preserve equality."
                }
              ]
            },
            {
              id: "lesson-balance-model",
              levelId: "level-equations-introduction",
              slug: "balance-model",
              title: "Balance model",
              summary: "Use matching changes to keep an equation balanced.",
              durationMinutes: 12,
              order: 2,
              prerequisites: ["lesson-what-is-an-equation"],
              steps: [
                {
                  id: "step-balance-intro",
                  lessonId: "lesson-balance-model",
                  type: "intro",
                  title: "Keep equality true",
                  order: 1,
                  body: "Whatever you do to one side of a balanced equation must happen to the other side."
                },
                {
                  id: "step-balance-visual",
                  lessonId: "lesson-balance-model",
                  type: "visual_model",
                  title: "Remove matching weight",
                  order: 2,
                  body: "For x + 3 = 7, removing 3 from both sides leaves x = 4.",
                  metadata: {
                    model: "balance-scale",
                    before: {
                      left: "x + 3",
                      right: "7"
                    },
                    after: {
                      left: "x",
                      right: "4"
                    }
                  }
                },
                {
                  id: "step-balance-numeric",
                  lessonId: "lesson-balance-model",
                  type: "exercise",
                  title: "Find the missing value",
                  order: 3,
                  exercise: {
                    id: "exercise-balance-numeric",
                    type: "numeric_input",
                    prompt: "What value of x makes x + 3 = 7 true?",
                    correctAnswer: {
                      value: 4,
                      tolerance: 0
                    },
                    points: 6,
                    explanation: "Substituting 4 gives 4 + 3 = 7."
                  },
                  metadata: {
                    progressiveHints: [
                      "Think about what number plus 3 gives 7.",
                      "Undo plus 3 by subtracting 3.",
                      "7 - 3 = 4."
                    ],
                    guidedSolution: [
                      "Start with x + 3 = 7.",
                      "Subtract 3 from both sides.",
                      "The result is x = 4."
                    ],
                    feedback: {
                      correct: "Correct. The balance stays true when x is 4.",
                      incorrect: "Recheck by substituting your value into x + 3."
                    }
                  }
                },
                {
                  id: "step-balance-summary",
                  lessonId: "lesson-balance-model",
                  type: "summary",
                  title: "Balance rule",
                  order: 4,
                  body: "Balanced equations stay balanced when the same operation is applied to both sides."
                }
              ]
            }
          ]
        },
        {
          id: "level-solving-by-substitution",
          courseId: "course-solving-equations",
          slug: "solving-by-substitution",
          title: "Solving by Substitution",
          summary: "Check candidate values and build a short solving path.",
          order: 2,
          prerequisites: ["level-equations-introduction"],
          lessons: [
            {
              id: "lesson-solving-simple-equations",
              levelId: "level-solving-by-substitution",
              slug: "solving-simple-equations",
              title: "Solving simple equations",
              summary: "Solve a one-step equation and verify the answer.",
              durationMinutes: 12,
              order: 1,
              prerequisites: ["lesson-balance-model"],
              steps: [
                {
                  id: "step-substitution-intro",
                  lessonId: "lesson-solving-simple-equations",
                  type: "intro",
                  title: "Try and verify",
                  order: 1,
                  body: "Substitution checks whether a candidate value makes an equation true."
                },
                {
                  id: "step-substitution-concept",
                  lessonId: "lesson-solving-simple-equations",
                  type: "concept",
                  title: "Replace the unknown",
                  order: 2,
                  body: "To test x = 5 in 2x = 10, replace x with 5 and compare both sides."
                },
                {
                  id: "step-substitution-guided",
                  lessonId: "lesson-solving-simple-equations",
                  type: "exercise",
                  title: "Solve step by step",
                  order: 3,
                  exercise: {
                    id: "exercise-substitution-steps",
                    type: "step_by_step",
                    prompt: "Solve 2x = 10 using substitution and verification.",
                    steps: [
                      {
                        id: "guided-step-candidate",
                        prompt: "What value should you test for x?",
                        expectedAnswer: 5,
                        hint: "Find the number that doubles to 10."
                      },
                      {
                        id: "guided-step-substitute",
                        prompt: "What expression do you get after replacing x with 5?",
                        expectedAnswer: "2 * 5 = 10",
                        hint: "Keep the structure of 2x = 10 and replace only x."
                      },
                      {
                        id: "guided-step-verify",
                        prompt: "Is the equation true after substitution?",
                        expectedAnswer: "yes",
                        hint: "Compare 2 * 5 with 10."
                      }
                    ],
                    points: 9,
                    explanation: "The guided solution verifies that 2 * 5 equals 10."
                  },
                  metadata: {
                    progressiveHints: [
                      "Ask what number multiplied by 2 makes 10.",
                      "Replace x with that number in the original equation.",
                      "Only accept the value if both sides match."
                    ],
                    guidedSolution: [
                      "Choose x = 5.",
                      "Substitute: 2 * 5 = 10.",
                      "Since 10 = 10, x = 5 solves the equation."
                    ],
                    feedback: {
                      correct: "Good. You solved and verified the value.",
                      incorrect: "Use substitution to check each intermediate statement."
                    }
                  }
                },
                {
                  id: "step-substitution-reflection",
                  lessonId: "lesson-solving-simple-equations",
                  type: "reflection",
                  title: "Reflect",
                  order: 4,
                  body: "Why is checking the answer part of solving?"
                },
                {
                  id: "step-substitution-completion",
                  lessonId: "lesson-solving-simple-equations",
                  type: "completion",
                  title: "Complete",
                  order: 5,
                  body: "You can now solve a simple equation and verify the result."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
} satisfies Subject;
