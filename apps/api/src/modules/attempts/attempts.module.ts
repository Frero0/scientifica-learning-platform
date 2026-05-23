import { Module } from "@nestjs/common";

import { ExercisesModule } from "../exercises/exercises.module";
import { ProgressModule } from "../progress/progress.module";
import { AttemptsController } from "./attempts.controller";
import { AttemptsRepository } from "./attempts.repository";
import { AttemptsService } from "./attempts.service";

@Module({
  imports: [ExercisesModule, ProgressModule],
  controllers: [AttemptsController],
  providers: [AttemptsRepository, AttemptsService]
})
export class AttemptsModule {}
