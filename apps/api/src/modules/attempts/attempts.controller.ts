import { Body, Controller, Post } from "@nestjs/common";

import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { submitAttemptSchema, type SubmitAttemptInput } from "./attempts.schema";
import { AttemptsService } from "./attempts.service";

@Controller("attempts")
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  submitAttempt(
    @Body(new ZodValidationPipe(submitAttemptSchema))
    body: SubmitAttemptInput
  ) {
    return this.attemptsService.submitAttempt(body);
  }
}
