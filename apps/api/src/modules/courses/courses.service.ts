import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { toDomainCourseLevel } from "../../common/mappers/prisma-domain.mapper";
import { CoursesRepository } from "./courses.repository";
import { type CourseWithPath } from "./courses.repository";
import type { CourseDetailDto, CourseSummaryDto } from "./courses.types";

@Injectable()
export class CoursesService {
  constructor(@Inject(CoursesRepository) private readonly coursesRepository: CoursesRepository) {}

  async listCourses(): Promise<CourseSummaryDto[]> {
    const courses = await this.coursesRepository.findAll();
    return courses.map((course) => this.toSummaryDto(course));
  }

  async getCourseBySlug(slug: string): Promise<CourseDetailDto> {
    const course = await this.coursesRepository.findBySlug(slug);

    if (!course) {
      throw new NotFoundException(`Course with slug "${slug}" was not found.`);
    }

    return {
      ...this.toSummaryDto(course),
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          durationMinutes: lesson.durationMinutes,
          order: lesson.order,
          exerciseCount: lesson.exercises.length
        }))
      }))
    };
  }

  private toSummaryDto(course: CourseWithPath): CourseSummaryDto {
    const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
    const exerciseCount = course.modules.reduce(
      (total, module) =>
        total +
        module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.exercises.length, 0),
      0
    );

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      description: course.description,
      level: toDomainCourseLevel(course.level),
      estimatedMinutes: course.estimatedMinutes,
      moduleCount: course.modules.length,
      lessonCount,
      exerciseCount
    };
  }
}
