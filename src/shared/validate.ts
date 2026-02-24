import { Context } from "@oak/oak";
import { z } from "zod";
import { Result, fail, ok } from './result.ts';
import { ValidationError } from './error.ts';

export async function validate<T>(
  ctx: Context,
  schema: z.ZodType<T>, // z.ZodType replaces ZodSchema in Zod v4
): Promise<Result<T>> {
  const body = await ctx.request.body.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    // z.flattenError() is the Zod v4 replacement for result.error.flatten()
    const flat = z.flattenError(result.error);

    // Collect per-field errors: "clientId: clientId must be a valid UUID"
    const fieldMessages = Object.entries(flat.fieldErrors)
      .map(([field, messages]) => `${field}: ${messages}`)
      .join(", ");

    // Collect top-level form errors (e.g. when the whole body is the wrong type)
    const formMessages = flat.formErrors.join(", ");

    const message = [fieldMessages, formMessages].filter(Boolean).join(", ");

    return fail({code: "VALIDATION_ERROR", message})
  }

  return ok(result.data);
}