import { Controller, Get, Param } from "@nestjs/common";

import { GamificationService } from "./gamification.service";

@Controller("gamification")
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("achievements/:userId")
  getUserAchievements(@Param("userId") userId: string) {
    return this.gamificationService.getUserAchievements(userId);
  }
}
