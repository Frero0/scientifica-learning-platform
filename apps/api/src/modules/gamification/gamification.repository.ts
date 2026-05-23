import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class GamificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async awardIfMissing(userId: string, key: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: {
        key
      }
    });

    if (!achievement) {
      return null;
    }

    return this.prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id
        }
      },
      update: {},
      create: {
        userId,
        achievementId: achievement.id
      },
      include: {
        achievement: true
      }
    });
  }

  findUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: {
        userId
      },
      include: {
        achievement: true
      },
      orderBy: {
        unlockedAt: "desc"
      }
    });
  }
}
