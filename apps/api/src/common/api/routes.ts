import type { FastifyRequest } from "fastify";
import type { ApiPaginationMeta } from "./contracts.js";
import { API_ERROR_CODES } from "./contracts.js";
import { AppError } from "./errors.js";
import { parseWithSchema, type ParseSchemaOptions, z } from "./validation.js";

export type RequestMetaExtras = Record<string, unknown>;

export interface ParseRequestOptions
  extends Omit<ParseSchemaOptions, "source"> {}

export interface AssertFoundOptions<TDetails extends RequestMetaExtras> {
  resourceName: string;
  message?: string;
  details?: TDetails;
}

export function createRequestMeta<TExtra extends RequestMetaExtras = Record<string, never>>(
  request: FastifyRequest,
  extra?: TExtra
): { requestId: string } & TExtra {
  return {
    requestId: request.id,
    ...(extra ?? ({} as TExtra))
  };
}

export function createPaginationMeta<
  TExtra extends RequestMetaExtras = Record<string, never>
>(
  request: FastifyRequest,
  pagination: ApiPaginationMeta,
  extra?: TExtra
): { requestId: string; pagination: ApiPaginationMeta } & TExtra {
  return createRequestMeta(request, {
    pagination,
    ...(extra ?? ({} as TExtra))
  });
}

export function parseRequestParams<TSchema extends z.ZodTypeAny>(
  request: FastifyRequest,
  schema: TSchema,
  options: ParseRequestOptions = {}
): z.infer<TSchema> {
  return parseWithSchema(schema, request.params, {
    ...options,
    source: "params"
  });
}

export function parseRequestQuery<TSchema extends z.ZodTypeAny>(
  request: FastifyRequest,
  schema: TSchema,
  options: ParseRequestOptions = {}
): z.infer<TSchema> {
  return parseWithSchema(schema, request.query, {
    ...options,
    source: "query"
  });
}

export function parseRequestBody<TSchema extends z.ZodTypeAny>(
  request: FastifyRequest,
  schema: TSchema,
  options: ParseRequestOptions = {}
): z.infer<TSchema> {
  return parseWithSchema(schema, request.body, {
    ...options,
    source: "body"
  });
}

export function assertFound<TValue, TDetails extends RequestMetaExtras = Record<string, never>>(
  value: TValue | null | undefined,
  options: AssertFoundOptions<TDetails>
): TValue {
  if (value === null || value === undefined) {
    throw new AppError({
      statusCode: 404,
      code: API_ERROR_CODES.NOT_FOUND,
      message: options.message ?? `${options.resourceName} not found.`,
      details: options.details
    });
  }

  return value;
}