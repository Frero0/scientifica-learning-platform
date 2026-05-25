import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, beforeAll, afterAll, it } from "vitest";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/common/prisma/prisma.service";

const demoCourseSlug = "foundations-of-scientific-thinking";
const demoLessonId = "lesson-observation-hypothesis-evidence";
const demoExerciseId = "exercise-isolate-variable";
const smokeUserId = `api-db-smoke-${process.pid}-${Date.now()}`;

type CourseSummary = {
  slug: string;
  title: string;
  lessonCount: number;
  exerciseCount: number;
};

type LessonDetail = {
  id: string;
  title: string;
  course: {
    slug: string;
  };
  exercises: Array<{
    id: string;
    type: string;
    points: number;
  }>;
};

type SubmitAttemptResponse = {
  attemptId: string;
  correct: boolean;
  score: number;
  progress: ProgressItem;
};

type ProgressItem = {
  userId: string;
  courseSlug: string;
  lessonId?: string;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: string;
};

type UserProgressResponse = {
  userId: string;
  items: ProgressItem[];
};

type CoursePathResponse = {
  id: string;
  slug: string;
  difficulty: string;
  levels: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      steps: Array<{
        id: string;
        type: string;
        order: number;
        exercise?: {
          id: string;
          type: string;
          prompt: string;
        };
      }>;
    }>;
  }>;
};

type LessonPlayerResponse = {
  id: string;
  course: {
    slug: string;
  };
  progress: {
    currentStepId?: string;
    completedStepIds: string[];
    status: string;
    exercises: Array<{
      exerciseId: string;
      stepId: string;
      status: string;
    }>;
  };
  steps: Array<{
    id: string;
    type: string;
    order: number;
    progress: {
      status: string;
      locked: boolean;
      current: boolean;
      completed: boolean;
    };
    content?: {
      kind: string;
    };
    quiz?: {
      id: string;
      exerciseType: string;
      prompt: string;
    };
    exercise?: {
      id: string;
      exerciseType: string;
      prompt: string;
    };
  }>;
};

describe("API database-backed smoke tests", () => {
  let app: INestApplication | undefined;
  let baseUrl: string;
  let prisma: PrismaService | undefined;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(0);

    baseUrl = await app.getUrl();
    prisma = app.get(PrismaService);
    await deleteSmokeUser();
  });

  afterAll(async () => {
    await deleteSmokeUser();
    await app?.close();
  });

  it("returns seeded courses", async () => {
    const { response, payload } = await requestJson<CourseSummary[]>("/courses");

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: demoCourseSlug,
          title: "Foundations of Scientific Thinking",
          lessonCount: 1,
          exerciseCount: 3
        })
      ])
    );
  });

  it("returns a seeded lesson with public exercises", async () => {
    const { response, payload } = await requestJson<LessonDetail>(`/lessons/${demoLessonId}`);
    const firstExercise = payload.exercises[0];

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      id: demoLessonId,
      title: "Observation, Hypothesis, Evidence",
      course: {
        slug: demoCourseSlug
      }
    });
    expect(payload.exercises).toHaveLength(3);
    expect(firstExercise).toMatchObject({
      id: demoExerciseId,
      type: "multiple_choice",
      points: 10
    });
    expect(firstExercise).not.toHaveProperty("correctAnswer");
  });

  it("returns a course path DTO with levels and composed steps", async () => {
    const { response, payload } = await requestJson<CoursePathResponse>(
      "/courses/course-scientific-thinking/path"
    );

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      id: "course-scientific-thinking",
      slug: demoCourseSlug,
      difficulty: "beginner"
    });
    expect(payload.levels[0]).toMatchObject({
      title: "Thinking Like a Scientist"
    });

    const steps = payload.levels[0]?.lessons[0]?.steps;

    expect(steps?.map((step) => step.type)).toEqual([
      "intro",
      "concept",
      "visual_model",
      "exercise",
      "exercise",
      "exercise"
    ]);
    expect(steps?.map((step) => step.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(steps?.find((step) => step.exercise?.id === demoExerciseId)).toMatchObject({
      type: "exercise",
      exercise: {
        id: demoExerciseId,
        type: "multiple_choice"
      }
    });
  });

  it("returns a lesson player DTO with discriminated player steps", async () => {
    const { response, payload } = await requestJson<LessonPlayerResponse>(
      `/lessons/${demoLessonId}/player`
    );

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      id: demoLessonId,
      course: {
        slug: demoCourseSlug
      },
      progress: {
        currentStepId: `${demoLessonId}-intro`,
        completedStepIds: [],
        status: "available"
      }
    });
    expect(payload.steps.map((step) => step.type)).toEqual([
      "content",
      "content",
      "content",
      "quiz",
      "exercise",
      "exercise"
    ]);
    expect(payload.steps.map((step) => step.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(payload.steps[0]).toMatchObject({
      type: "content",
      content: {
        kind: "intro"
      },
      progress: {
        current: true,
        locked: false
      }
    });
    expect(payload.steps.find((step) => step.quiz?.id === demoExerciseId)).toMatchObject({
      type: "quiz",
      quiz: {
        id: demoExerciseId,
        exerciseType: "multiple_choice"
      }
    });
    expect(JSON.stringify(payload)).not.toContain("answer");
    expect(JSON.stringify(payload)).not.toContain("expectedAnswer");
  });

  it("records a valid attempt and exposes updated progress", async () => {
    const { response, payload } = await requestJson<SubmitAttemptResponse>("/attempts", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        userId: smokeUserId,
        exerciseId: demoExerciseId,
        answer: "longer-period-observation"
      })
    });

    expect(response.status).toBe(201);
    expect(payload).toMatchObject({
      correct: true,
      score: 10,
      progress: {
        userId: smokeUserId,
        courseSlug: demoCourseSlug,
        lessonId: demoLessonId,
        completedExercises: 1,
        totalExercises: 3,
        percent: 33,
        status: "in_progress"
      }
    });
    expect(typeof payload.attemptId).toBe("string");

    const progress = await requestJson<UserProgressResponse>(`/progress/${smokeUserId}`);

    expect(progress.response.status).toBe(200);
    expect(progress.payload).toMatchObject({
      userId: smokeUserId,
      items: [
        expect.objectContaining({
          courseSlug: demoCourseSlug,
          lessonId: demoLessonId,
          completedExercises: 1,
          totalExercises: 3,
          percent: 33,
          status: "in_progress"
        })
      ]
    });
  });

  async function requestJson<T>(
    path: string,
    options?: Parameters<typeof fetch>[1]
  ): Promise<{ response: Response; payload: T }> {
    const response = await fetch(`${baseUrl}${path}`, options);
    const payload = (await response.json()) as T;

    return {
      response,
      payload
    };
  }

  async function deleteSmokeUser(): Promise<void> {
    await prisma?.user.deleteMany({
      where: {
        id: smokeUserId
      }
    });
  }
});
