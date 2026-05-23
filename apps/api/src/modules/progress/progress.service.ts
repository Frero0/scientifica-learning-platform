import { Injectable } from "@nestjs/common";

import {
  toDomainProgressStatus,
  toPrismaProgressStatus
} from "../../common/mappers/prisma-domain.mapper";
import { GamificationService } from "../gamification/gamification.service";
import { ProgressRepository } from "./progress.repository";
import { type ProgressWithContent } from "./progress.repository";
import type {
  ProgressItemDto,
  RecordExerciseProgressInput,
  UserProgressDto
} from "./progress.types";

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly gamificationService: GamificationService
  ) {}

  async getUserProgress(userId: string): Promise<UserProgressDto> {
    const [items, achievements] = await Promise.all([
      this.progressRepository.findByUserId(userId),
      this.gamificationService.getUserAchievements(userId)
    ]);

    return {
      userId,
      items: items.map((item) => this.toDto(item)),
      achievements
    };
  }

  async recordExerciseAttempt(input: RecordExerciseProgressInput): Promise<ProgressItemDto> {
    const [totalExercises, completedExercises] = await Promise.all([
      this.progressRepository.countLessonExercises(input.lessonId),
      this.progressRepository.countCompletedExercises(input.userId, input.lessonId)
    ]);

    const percent =
      totalExercises > 0
        ? Math.min(100, Math.round((completedExercises / totalExercises) * 100))
        : 0;
    const status =
      completedExercises >= totalExercises && totalExercises > 0 ? "completed" : "in_progress";

    const progress = await this.progressRepository.upsertLessonProgress({
      userId: input.userId,
      courseId: input.courseId,
      lessonId: input.lessonId,
      exerciseId: input.exerciseId,
      completedExercises,
      totalExercises,
      percent,
      status: toPrismaProgressStatus(status)
    });

    if (input.correct && completedExercises === 1) {
      await this.gamificationService.awardAchievement(input.userId, "first-correct-observation");
    }

    if (status === "completed") {
      await this.gamificationService.awardAchievement(input.userId, "lesson-complete");
    }

    return this.toDto(progress);
  }

  private toDto(progress: ProgressWithContent): ProgressItemDto {
    return {
      id: progress.id,
      userId: progress.userId,
      courseId: progress.courseId,
      courseSlug: progress.course.slug,
      courseTitle: progress.course.title,
      ...(progress.lessonId ? { lessonId: progress.lessonId } : {}),
      ...(progress.lesson ? { lessonTitle: progress.lesson.title } : {}),
      completedExercises: progress.completedExercises,
      totalExercises: progress.totalExercises,
      percent: progress.percent,
      status: toDomainProgressStatus(progress.status),
      updatedAt: progress.updatedAt.toISOString()
    };
  }
}
