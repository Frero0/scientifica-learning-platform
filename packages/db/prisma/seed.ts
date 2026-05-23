import { PrismaClient, ExerciseType, CourseLevel, ProgressStatus } from "@prisma/client";

const prisma = new PrismaClient();

const demoUserId = "demo-user";
const demoCourseId = "course-scientific-thinking";
const demoModuleId = "module-thinking-like-a-scientist";
const demoLessonId = "lesson-observation-hypothesis-evidence";

async function main(): Promise<void> {
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.exerciseAttempt.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: demoUserId,
      email: "demo@scientifica.local",
      name: "Demo Learner"
    }
  });

  const course = await prisma.course.create({
    data: {
      id: demoCourseId,
      slug: "foundations-of-scientific-thinking",
      title: "Foundations of Scientific Thinking",
      summary: "Learn how observation, models, and evidence work together.",
      description:
        "A first learning path for building the habits behind scientific problem solving: observe carefully, isolate variables, test explanations, and update beliefs with evidence.",
      level: CourseLevel.BEGINNER,
      estimatedMinutes: 45,
      modules: {
        create: [
          {
            id: demoModuleId,
            title: "Thinking Like a Scientist",
            description:
              "Turn everyday observations into testable hypotheses and measurable predictions.",
            order: 1,
            lessons: {
              create: [
                {
                  id: demoLessonId,
                  slug: "observation-hypothesis-evidence",
                  title: "Observation, Hypothesis, Evidence",
                  summary:
                    "Use a simple pendulum experiment to separate observation from explanation.",
                  durationMinutes: 12,
                  order: 1,
                  content: {
                    introduction:
                      "A pendulum is a clean system for practicing scientific reasoning because one visible motion depends on a small set of variables.",
                    keyIdeas: [
                      "An observation describes what changed without explaining why.",
                      "A hypothesis proposes a mechanism that can be tested.",
                      "Evidence becomes useful when variables are isolated."
                    ],
                    visualExplanation: {
                      title: "Pendulum period model",
                      description:
                        "For small angles, period depends mostly on length and gravity, not mass.",
                      variables: [
                        {
                          symbol: "T",
                          label: "period"
                        },
                        {
                          symbol: "L",
                          label: "length"
                        },
                        {
                          symbol: "g",
                          label: "gravity"
                        }
                      ]
                    }
                  },
                  exercises: {
                    create: [
                      {
                        id: "exercise-isolate-variable",
                        type: ExerciseType.MULTIPLE_CHOICE,
                        prompt:
                          "You change the pendulum length and measure a longer swing period. Which statement is the best scientific observation?",
                        explanation:
                          "The statement reports what changed without adding an unsupported cause. Explanation comes after controlled comparison.",
                        options: [
                          {
                            id: "a",
                            label: "The heavier pendulum stores more energy.",
                            value: "energy-claim"
                          },
                          {
                            id: "b",
                            label: "The longer pendulum completed each swing in more time.",
                            value: "longer-period-observation"
                          },
                          {
                            id: "c",
                            label: "Gravity became weaker during the trial.",
                            value: "gravity-claim"
                          }
                        ],
                        answer: "longer-period-observation",
                        points: 10,
                        order: 1
                      },
                      {
                        id: "exercise-pendulum-period",
                        type: ExerciseType.NUMERIC_INPUT,
                        prompt:
                          "A pendulum has a length of 1 meter. Using T = 2*pi*sqrt(L/g) with g = 9.8 m/s^2, estimate the period in seconds.",
                        explanation:
                          "T = 2*pi*sqrt(1 / 9.8), which is approximately 2.0 seconds.",
                        answer: {
                          value: 2,
                          tolerance: 0.15
                        },
                        points: 15,
                        order: 2
                      },
                      {
                        id: "exercise-build-hypothesis",
                        type: ExerciseType.STEP_BY_STEP,
                        prompt:
                          "Build a short hypothesis from the pendulum observation by connecting the variable to a measurable prediction.",
                        explanation:
                          "A useful hypothesis connects a changed variable to a measurable outcome.",
                        steps: [
                          {
                            id: "step-variable",
                            title: "Variable",
                            prompt: "Identify the variable being changed.",
                            expectedAnswer: "length"
                          },
                          {
                            id: "step-prediction",
                            title: "Prediction",
                            prompt: "Predict the effect on the period.",
                            expectedAnswer: "period increases"
                          }
                        ],
                        answer: {
                          steps: ["length", "period increases"]
                        },
                        points: 20,
                        order: 3
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  const exerciseCount = await prisma.exercise.count({
    where: {
      lessonId: demoLessonId
    }
  });

  await prisma.progress.create({
    data: {
      userId: demoUserId,
      courseId: course.id,
      lessonId: demoLessonId,
      completedExercises: 0,
      totalExercises: exerciseCount,
      percent: 0,
      status: ProgressStatus.NOT_STARTED
    }
  });

  await prisma.achievement.createMany({
    data: [
      {
        courseId: course.id,
        key: "first-correct-observation",
        title: "Clean Observer",
        description: "Answered an observation question without jumping to explanation.",
        points: 25
      },
      {
        courseId: course.id,
        key: "lesson-complete",
        title: "Evidence Builder",
        description: "Completed every exercise in the lesson.",
        points: 50
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
