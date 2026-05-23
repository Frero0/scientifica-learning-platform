import { Module } from "@nestjs/common";

import { GamificationModule } from "../gamification/gamification.module";
import { ProgressController } from "./progress.controller";
import { ProgressRepository } from "./progress.repository";
import { ProgressService } from "./progress.service";

@Module({
  imports: [GamificationModule],
  controllers: [ProgressController],
  providers: [ProgressRepository, ProgressService],
  exports: [ProgressService]
})
export class ProgressModule {}
