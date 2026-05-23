import { Injectable } from "@nestjs/common";
import { evaluateExerciseAttempt } from "@scientifica/domain";

import { ExercisesService } from "../exercises/exercises.service";
import { ProgressService } from "../progress/progress.service";
import type { ProgressItemDto } from "../progress/progress.types";
import { AttemptsRepository } from "./attempts.repository";
import type { SubmitAttemptInput } from "./attempts.schema";

const demoUserId = "demo-user";

export type SubmitAttemptResultDto = {
  attemptId: string;
  correct: boolean;
  score: number;
  feedback: string;
  expectedAnswer?: unknown;
  progress: ProgressItemDto;
};

@Injectable()
export class AttemptsService {
  constructor(
    private readonly attemptsRepository: AttemptsRepository,
    private readonly exercisesService: ExercisesService,
    private readonly progressService: ProgressService
  ) {}

  async submitAttempt(input: SubmitAttemptInput): Promise<SubmitAttemptResultDto> {
    const userId = input.userId ?? demoUserId;

    await this.attemptsRepository.ensureDemoUser(userId);

    const exerciseRecord = await this.exercisesService.getExerciseForAttempt(input.exerciseId);
    const exercise = this.exercisesService.toDomainExercise(exerciseRecord);
    const evaluation = evaluateExerciseAttempt(exercise, input.answer);

    const attempt = await this.attemptsRepository.createAttempt({
      exerciseId: exercise.id,
      userId,
      answer: input.answer,
      correct: evaluation.correct,
      score: evaluation.score,
      feedback: evaluation.feedback
    });

    const progress = await this.progressService.recordExerciseAttempt({
      userId,
      courseId: exerciseRecord.lesson.module.courseId,
      lessonId: exerciseRecord.lessonId,
      exerciseId: exerciseRecord.id,
      correct: evaluation.correct
    });

    return {
      attemptId: attempt.id,
      correct: evaluation.correct,
      score: evaluation.score,
      feedback: evaluation.feedback,
      ...(evaluation.expectedAnswer !== undefined ? { expectedAnswer: evaluation.expectedAnswer } : {}),
      progress
    };
  }
}
