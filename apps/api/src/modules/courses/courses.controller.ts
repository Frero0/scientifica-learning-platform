import { Controller, Get, Inject, Param, Query } from "@nestjs/common";

import { CoursesService } from "./courses.service";

@Controller("courses")
export class CoursesController {
  constructor(@Inject(CoursesService) private readonly coursesService: CoursesService) {}

  @Get()
  listCourses() {
    return this.coursesService.listCourses();
  }

  @Get(":id/path")
  getCoursePathById(@Param("id") id: string, @Query("userId") userId?: string) {
    return this.coursesService.getCoursePathById(id, userId);
  }

  @Get(":slug")
  getCourseBySlug(@Param("slug") slug: string) {
    return this.coursesService.getCourseBySlug(slug);
  }
}
