import { Module } from "@nestjs/common";

import { CoursesController } from "./courses.controller";
import { CoursesRepository } from "./courses.repository";
import { CoursesService } from "./courses.service";

@Module({
  controllers: [CoursesController],
  providers: [CoursesRepository, CoursesService],
  exports: [CoursesService]
})
export class CoursesModule {}
