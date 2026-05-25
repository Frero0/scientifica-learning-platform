import { Controller, Get, Inject, Param } from "@nestjs/common";

import { LessonsService } from "./lessons.service";

@Controller("lessons")
export class LessonsController {
  constructor(@Inject(LessonsService) private readonly lessonsService: LessonsService) {}

  @Get(":id")
  getLessonById(@Param("id") id: string) {
    return this.lessonsService.getLessonById(id);
  }
}
