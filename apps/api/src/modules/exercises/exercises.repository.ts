import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@scientifica/db";

import { PrismaService } from "../../common/prisma/prisma.service";

const exerciseWithLesson = {
  lesson: {
    include: {
      module: true
    }
  }
} satisfies Prisma.ExerciseInclude;

export type ExerciseWithLesson = Prisma.ExerciseGetPayload<{
  include: typeof exerciseWithLesson;
}>;

@Injectable()
export class ExercisesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findByIdWithLesson(id: string): Promise<ExerciseWithLesson | null> {
    return this.prisma.exercise.findUnique({
      where: {
        id
      },
      include: exerciseWithLesson
    });
  }
}
