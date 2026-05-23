import { Injectable } from "@nestjs/common";

import { GamificationRepository } from "./gamification.repository";
import type { AchievementDto } from "./gamification.types";

@Injectable()
export class GamificationService {
  constructor(private readonly gamificationRepository: GamificationRepository) {}

  async awardAchievement(userId: string, key: string): Promise<AchievementDto | null> {
    const award = await this.gamificationRepository.awardIfMissing(userId, key);
    return award ? this.toDto(award) : null;
  }

  async getUserAchievements(userId: string): Promise<AchievementDto[]> {
    const achievements = await this.gamificationRepository.findUserAchievements(userId);
    return achievements.map((achievement) => this.toDto(achievement));
  }

  private toDto(
    record: Awaited<ReturnType<GamificationRepository["findUserAchievements"]>>[number]
  ): AchievementDto {
    return {
      id: record.achievement.id,
      key: record.achievement.key,
      title: record.achievement.title,
      description: record.achievement.description,
      points: record.achievement.points,
      unlockedAt: record.unlockedAt.toISOString()
    };
  }
}
