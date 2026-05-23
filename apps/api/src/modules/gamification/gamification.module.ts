import { Module } from "@nestjs/common";

import { GamificationController } from "./gamification.controller";
import { GamificationRepository } from "./gamification.repository";
import { GamificationService } from "./gamification.service";

@Module({
  controllers: [GamificationController],
  providers: [GamificationRepository, GamificationService],
  exports: [GamificationService]
})
export class GamificationModule {}
