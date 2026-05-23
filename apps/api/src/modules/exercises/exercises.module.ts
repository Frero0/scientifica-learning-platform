import { Module } from "@nestjs/common";

import { ExercisesRepository } from "./exercises.repository";
import { ExercisesService } from "./exercises.service";

@Module({
  providers: [ExercisesRepository, ExercisesService],
  exports: [ExercisesService]
})
export class ExercisesModule {}
