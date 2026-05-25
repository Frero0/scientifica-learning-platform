import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@scientifica/db";

import { PrismaService } from "../../common/prisma/prisma.service";

const lessonDetailInclude = {
  module: {
    include: {
      course: true
    }
  },
  exercises: {
    orderBy: {
      order: "asc"
    }
  }
} satisfies Prisma.LessonInclude;

export type LessonDetailRecord = Prisma.LessonGetPayload<{
  include: typeof lessonDetailInclude;
}>;

export type LessonPlayerProgressRecord = {
  lessonId: string | null;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: string;
  lastExerciseId: string | null;
};

@Injectable()
export class LessonsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(id: string): Promise<LessonDetailRecord | null> {
    return this.prisma.lesson.findUnique({
      where: {
        id
      },
      include: lessonDetailInclude
    });
  }

  findLessonProgress(userId: string, lessonId: string): Promise<LessonPlayerProgressRecord | null> {
    return this.prisma.progress.findFirst({
      where: {
        userId,
        lessonId
      },
      select: {
        lessonId: true,
        completedExercises: true,
        totalExercises: true,
        percent: true,
        status: true,
        lastExerciseId: true
      }
    });
  }

  async findAttemptedExerciseIdsForLesson(userId: string, lessonId: string): Promise<string[]> {
    const attempts = await this.prisma.exerciseAttempt.findMany({
      where: {
        userId,
        exercise: {
          lessonId
        }
      },
      distinct: ["exerciseId"],
      select: {
        exerciseId: true
      }
    });

    return attempts.map((attempt) => attempt.exerciseId);
  }

  async findCompletedExerciseIdsForLesson(userId: string, lessonId: string): Promise<string[]> {
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

    return attempts.map((attempt) => attempt.exerciseId);
  }
}
