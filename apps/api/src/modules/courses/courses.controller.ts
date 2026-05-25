import { Controller, Get, Inject, Param } from "@nestjs/common";

import { CoursesService } from "./courses.service";

@Controller("courses")
export class CoursesController {
  constructor(@Inject(CoursesService) private readonly coursesService: CoursesService) {}

  @Get()
  listCourses() {
    return this.coursesService.listCourses();
  }

  @Get(":slug")
  getCourseBySlug(@Param("slug") slug: string) {
    return this.coursesService.getCourseBySlug(slug);
  }
}
