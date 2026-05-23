import { z } from "zod";

export const submitAttemptSchema = z.object({
  exerciseId: z.string().min(1),
  userId: z.string().min(1).optional(),
  answer: z.unknown().refine((value) => value !== undefined, "Answer is required")
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
