import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodTypeAny } from "zod";

export class ZodValidationPipe<TSchema extends ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        issues: result.error.flatten()
      });
    }

    return result.data;
  }
}
