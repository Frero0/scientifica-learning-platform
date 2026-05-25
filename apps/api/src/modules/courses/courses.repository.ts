import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@scientifica/db";

import { PrismaService } from "../../common/prisma/prisma.service";

const courseWithPath = {
  modules: {
    orderBy: {
      order: "asc"
    },
    include: {
      lessons: {
        orderBy: {
          order: "asc"
        },
        include: {
          exercises: {
            select: {
              id: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.CourseInclude;

export type CourseWithPath = Prisma.CourseGetPayload<{
  include: typeof courseWithPath;
}>;

const courseWithLearningPath = {
  modules: {
    orderBy: {
      order: "asc"
    },
    include: {
      lessons: {
        orderBy: {
          order: "asc"
        },
        include: {
          exercises: {
            orderBy: {
              order: "asc"
            }
          }
        }
      }
    }
  }
} satisfies Prisma.CourseInclude;

export type CourseWithLearningPath = Prisma.CourseGetPayload<{
  include: typeof courseWithLearningPath;
}>;

export type CoursePathLessonProgressRecord = {
  lessonId: string | null;
  completedExercises: number;
  totalExercises: number;
  percent: number;
  status: string;
};

@Injectable()
export class CoursesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAll(): Promise<CourseWithPath[]> {
    return this.prisma.course.findMany({
      include: courseWithPath,
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  findBySlug(slug: string): Promise<CourseWithPath | null> {
    return this.prisma.course.findUnique({
      where: {
        slug
      },
      include: courseWithPath
    });
  }

  findByIdWithLearningPath(id: string): Promise<CourseWithLearningPath | null> {
    return this.prisma.course.findUnique({
      where: {
        id
      },
      include: courseWithLearningPath
    });
  }

  findLessonProgressForCourse(
    userId: string,
    courseId: string
  ): Promise<CoursePathLessonProgressRecord[]> {
    return this.prisma.progress.findMany({
      where: {
        userId,
        courseId,
        lessonId: {
          not: null
        }
      },
      select: {
        lessonId: true,
        completedExercises: true,
        totalExercises: true,
        percent: true,
        status: true
      }
    });
  }

  async findAttemptedExerciseIdsForCourse(userId: string, courseId: string): Promise<string[]> {
    const attempts = await this.prisma.exerciseAttempt.findMany({
      where: {
        userId,
        exercise: {
          lesson: {
            module: {
              courseId
            }
          }
        }
      },
      distinct: ["exerciseId"],
      select: {
        exerciseId: true
      }
    });

    return attempts.map((attempt) => attempt.exerciseId);
  }

  async findCompletedExerciseIdsForCourse(userId: string, courseId: string): Promise<string[]> {
    const attempts = await this.prisma.exerciseAttempt.findMany({
      where: {
        userId,
        correct: true,
        exercise: {
          lesson: {
            module: {
              courseId
            }
          }
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
