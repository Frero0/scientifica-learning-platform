import type { Exercise as PrismaExercise } from "@scientifica/db";
import type { Exercise, ExerciseAnswer, ExerciseOption, ExerciseStep } from "@scientifica/domain";
import { z } from "zod";

import { toDomainExerciseType } from "../../common/mappers/prisma-domain.mapper";

export type PublicExerciseDto = {
  id: string;
  lessonId: string;
  type: Exercise["type"];
  prompt: string;
  explanation?: string;
  options?: ExerciseOption[];
  steps?: Array<Omit<ExerciseStep, "expectedAnswer">>;
  visualization?: Record<string, unknown>;
  points: number;
  order: number;
};

const optionsSchema = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    value: z.string()
  })
);

const stepsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    prompt: z.string(),
    expectedAnswer: z.unknown().optional(),
    hint: z.string().optional()
  })
);

export function toDomainExercise(record: PrismaExercise): Exercise {
  const options = parseOptions(record.options);
  const steps = parseSteps(record.steps);
  const visualization = parseRecord(record.visual);

  return {
    id: record.id,
    lessonId: record.lessonId,
    type: toDomainExerciseType(record.type),
    prompt: record.prompt,
    ...(record.explanation ? { explanation: record.explanation } : {}),
    ...(options.length > 0 ? { options } : {}),
    ...(steps.length > 0 ? { steps } : {}),
    ...(visualization ? { visualization } : {}),
    correctAnswer: record.answer as ExerciseAnswer,
    points: record.points,
    order: record.order
  };
}

export function toPublicExercise(record: PrismaExercise): PublicExerciseDto {
  const domainExercise = toDomainExercise(record);
  const publicSteps = domainExercise.steps?.map(({ expectedAnswer: _expectedAnswer, ...step }) => step);

  return {
    id: domainExercise.id,
    lessonId: domainExercise.lessonId,
    type: domainExercise.type,
    prompt: domainExercise.prompt,
    ...(domainExercise.explanation ? { explanation: domainExercise.explanation } : {}),
    ...(domainExercise.options ? { options: domainExercise.options } : {}),
    ...(publicSteps && publicSteps.length > 0 ? { steps: publicSteps } : {}),
    ...(domainExercise.visualization ? { visualization: domainExercise.visualization } : {}),
    points: domainExercise.points,
    order: domainExercise.order
  };
}

function parseOptions(value: unknown): ExerciseOption[] {
  const result = optionsSchema.safeParse(value);
  return result.success ? result.data : [];
}

function parseSteps(value: unknown): ExerciseStep[] {
  const result = stepsSchema.safeParse(value);
  return result.success ? result.data : [];
}

function parseRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
