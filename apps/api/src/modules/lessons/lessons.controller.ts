import { Controller, Get, Inject, Param, Query } from "@nestjs/common";

import { LessonsService } from "./lessons.service";

@Controller("lessons")
export class LessonsController {
  constructor(@Inject(LessonsService) private readonly lessonsService: LessonsService) {}

  @Get(":id/player")
  getLessonPlayerById(@Param("id") id: string, @Query("userId") userId?: string) {
    return this.lessonsService.getLessonPlayerById(id, userId);
  }

  @Get(":id")
  getLessonById(@Param("id") id: string) {
    return this.lessonsService.getLessonById(id);
  }
}
