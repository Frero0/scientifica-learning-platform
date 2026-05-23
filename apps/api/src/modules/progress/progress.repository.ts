import { Injectable } from "@nestjs/common";
import type { Prisma, ProgressStatus as PrismaProgressStatus } from "@scientifica/db";

import { PrismaService } from "../../common/prisma/prisma.service";

const progressWithContent = {
  course: true,
  lesson: true
} satisfies Prisma.ProgressInclude;

export type ProgressWithContent = Prisma.ProgressGetPayload<{
  include: typeof progressWithContent;
}>;

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<ProgressWithContent[]> {
    return this.prisma.progress.findMany({
      where: {
        userId
      },
      include: progressWithContent,
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  countLessonExercises(lessonId: string): Promise<number> {
    return this.prisma.exercise.count({
      where: {
        lessonId
      }
    });
  }

  async countCompletedExercises(userId: string, lessonId: string): Promise<number> {
    const attempts = await this.prisma.exerciseAttempt.findMany({
      where: {
        userId,
        correct: true,
        exercise: {
          lessonId
        }
      },
      distinct: ["exerciseId"],
      select: {
        exerciseId: true
      }
    });

    return attempts.length;
  }

  upsertLessonProgress(input: {
    userId: string;
    courseId: string;
    lessonId: string;
    exerciseId: string;
    completedExercises: number;
    totalExercises: number;
    percent: number;
    status: PrismaProgressStatus;
  }) {
    return this.prisma.progress.upsert({
      where: {
        userId_courseId_lessonId: {
          userId: input.userId,
          courseId: input.courseId,
          lessonId: input.lessonId
        }
      },
      update: {
        completedExercises: input.completedExercises,
        totalExercises: input.totalExercises,
        percent: input.percent,
        status: input.status,
        lastExerciseId: input.exerciseId
      },
      create: {
        userId: input.userId,
        courseId: input.courseId,
        lessonId: input.lessonId,
        completedExercises: input.completedExercises,
        totalExercises: input.totalExercises,
        percent: input.percent,
        status: input.status,
        lastExerciseId: input.exerciseId
      },
      include: progressWithContent
    });
  }
}
