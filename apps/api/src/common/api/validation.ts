import { z } from "zod";
import { API_ERROR_CODES } from "./contracts.js";
import { AppError } from "./errors.js";

export { z };

export type ValidationSource = "params" | "query" | "body" | "request";

export interface ParseSchemaOptions {
  source?: ValidationSource;
  statusCode?: number;
  message?: string;
}

export interface PaginationSchemaOptions {
  defaultLimit?: number;
  defaultOffset?: number;
  maxLimit?: number;
}

export function parseWithSchema<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown,
  options: ParseSchemaOptions = {}
): z.infer<TSchema> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new AppError({
      statusCode: options.statusCode ?? 400,
      code: API_ERROR_CODES.VALIDATION_ERROR,
      message: options.message ?? "Request validation failed.",
      details: {
        source: options.source ?? "request",
        issues: result.error.issues
      }
    });
  }

  return result.data;
}

export function createPaginationQuerySchema(
  options: PaginationSchemaOptions = {}
) {
  const defaultLimit = options.defaultLimit ?? 20;
  const defaultOffset = options.defaultOffset ?? 0;
  const maxLimit = options.maxLimit ?? 100;

  return z
    .object({
      limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
      offset: z.coerce.number().int().min(0).default(defaultOffset)
    })
    .strict();
}