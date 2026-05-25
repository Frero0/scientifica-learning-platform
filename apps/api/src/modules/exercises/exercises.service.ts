import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { toDomainExercise } from "./exercise.mapper";
import { ExercisesRepository } from "./exercises.repository";
import { type ExerciseWithLesson } from "./exercises.repository";

@Injectable()
export class ExercisesService {
  constructor(
    @Inject(ExercisesRepository) private readonly exercisesRepository: ExercisesRepository
  ) {}

  async getExerciseForAttempt(id: string): Promise<ExerciseWithLesson> {
    const exercise = await this.exercisesRepository.findByIdWithLesson(id);

    if (!exercise) {
      throw new NotFoundException(`Exercise with id "${id}" was not found.`);
    }

    return exercise;
  }

  toDomainExercise(record: ExerciseWithLesson) {
    return toDomainExercise(record);
  }
}
