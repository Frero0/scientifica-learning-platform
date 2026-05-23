import { Injectable } from "@nestjs/common";
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

@Injectable()
export class LessonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<LessonDetailRecord | null> {
    return this.prisma.lesson.findUnique({
      where: {
        id
      },
      include: lessonDetailInclude
    });
  }
}
