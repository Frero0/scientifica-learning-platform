import {
  CourseLevel as PrismaCourseLevel,
  ExerciseType as PrismaExerciseType,
  ProgressStatus as PrismaProgressStatus
} from "@scientifica/db";
import type { CourseLevel, ExerciseType, ProgressStatus } from "@scientifica/domain";

export function toDomainExerciseType(type: PrismaExerciseType): ExerciseType {
  const map: Record<PrismaExerciseType, ExerciseType> = {
    [PrismaExerciseType.MULTIPLE_CHOICE]: "multiple_choice",
    [PrismaExerciseType.NUMERIC_INPUT]: "numeric_input",
    [PrismaExerciseType.DRAG_AND_DROP]: "drag_and_drop",
    [PrismaExerciseType.INTERACTIVE_VISUALIZATION]: "interactive_visualization",
    [PrismaExerciseType.STEP_BY_STEP]: "step_by_step",
    [PrismaExerciseType.SIMULATION]: "simulation"
  };

  return map[type];
}

export function toDomainCourseLevel(level: PrismaCourseLevel): CourseLevel {
  const map: Record<PrismaCourseLevel, CourseLevel> = {
    [PrismaCourseLevel.BEGINNER]: "beginner",
    [PrismaCourseLevel.INTERMEDIATE]: "intermediate",
    [PrismaCourseLevel.ADVANCED]: "advanced"
  };

  return map[level];
}

export function toDomainProgressStatus(status: PrismaProgressStatus): ProgressStatus {
  const map: Record<PrismaProgressStatus, ProgressStatus> = {
    [PrismaProgressStatus.NOT_STARTED]: "not_started",
    [PrismaProgressStatus.IN_PROGRESS]: "in_progress",
    [PrismaProgressStatus.COMPLETED]: "completed"
  };

  return map[status];
}

export function toPrismaProgressStatus(status: ProgressStatus): PrismaProgressStatus {
  const map: Record<ProgressStatus, PrismaProgressStatus> = {
    not_started: PrismaProgressStatus.NOT_STARTED,
    in_progress: PrismaProgressStatus.IN_PROGRESS,
    completed: PrismaProgressStatus.COMPLETED
  };

  return map[status];
}
