import { Injectable } from "@nestjs/common";
import type { Prisma } from "@scientifica/db";

import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AttemptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  ensureDemoUser(userId: string) {
    return this.prisma.user.upsert({
      where: {
        id: userId
      },
      update: {},
      create: {
        id: userId,
        email: `${userId}@scientifica.local`,
        name: "Demo Learner"
      }
    });
  }

  createAttempt(input: {
    exerciseId: string;
    userId: string;
    answer: unknown;
    correct: boolean;
    score: number;
    feedback: string;
  }) {
    return this.prisma.exerciseAttempt.create({
      data: {
        exerciseId: input.exerciseId,
        userId: input.userId,
        answer: input.answer as Prisma.InputJsonValue,
        correct: input.correct,
        score: input.score,
        feedback: input.feedback
      }
    });
  }
}
