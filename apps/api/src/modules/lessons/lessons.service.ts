import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { LessonContent } from "@scientifica/domain";
import { z } from "zod";

import { toPublicExercise } from "../exercises/exercise.mapper";
import { LessonsRepository } from "./lessons.repository";
import { type LessonDetailRecord } from "./lessons.repository";
import type { LessonDetailDto } from "./lessons.types";

const lessonContentSchema = z.object({
  introduction: z.string(),
  keyIdeas: z.array(z.string()),
  visualExplanation: z.object({
    title: z.string(),
    description: z.string(),
    variables: z.array(
      z.object({
        symbol: z.string(),
        label: z.string()
      })
    )
  })
});

@Injectable()
export class LessonsService {
  constructor(@Inject(LessonsRepository) private readonly lessonsRepository: LessonsRepository) {}

  async getLessonById(id: string): Promise<LessonDetailDto> {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException(`Lesson with id "${id}" was not found.`);
    }

    return this.toDto(lesson);
  }

  private toDto(lesson: LessonDetailRecord): LessonDetailDto {
    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      durationMinutes: lesson.durationMinutes,
      order: lesson.order,
      module: {
        id: lesson.module.id,
        title: lesson.module.title
      },
      course: {
        id: lesson.module.course.id,
        slug: lesson.module.course.slug,
        title: lesson.module.course.title
      },
      content: this.parseContent(lesson.content),
      exercises: lesson.exercises.map(toPublicExercise)
    };
  }

  private parseContent(value: unknown): LessonContent {
    const result = lessonContentSchema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    return {
      introduction: "This lesson is missing structured content.",
      keyIdeas: [],
      visualExplanation: {
        title: "No visualization configured",
        description: "Add lesson content in the database seed or authoring workflow.",
        variables: []
      }
    };
  }
}
