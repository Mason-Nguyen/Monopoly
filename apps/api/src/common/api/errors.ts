import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import {
  API_ERROR_CODES,
  createErrorResponse,
  type ApiErrorCode,
  type ApiErrorResponse
} from "./contracts.js";

export interface AppErrorOptions<TDetails = unknown> {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  details?: TDetails;
}

export class AppError<TDetails = unknown> extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: TDetails;

  constructor(options: AppErrorOptions<TDetails>) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

function hasFastifyValidation(
  error: unknown
): error is {
  validation: unknown;
  validationContext?: string;
  message?: string;
} {
  return typeof error === "object" && error !== null && "validation" in error;
}

function normalizeApiError(
  error: unknown,
  requestId: string
): {
  statusCode: number;
  body: ApiErrorResponse<unknown>;
  shouldLog: boolean;
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: createErrorResponse({
        code: error.code,
        message: error.message,
        details: {
          requestId,
          ...(typeof error.details === "object" && error.details !== null
            ? error.details
            : error.details === undefined
              ? {}
              : { value: error.details })
        }
      }),
      shouldLog: error.statusCode >= 500
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: createErrorResponse({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Request validation failed.",
        details: {
          requestId,
          source: "request",
          issues: error.issues
        }
      }),
      shouldLog: false
    };
  }

  if (hasFastifyValidation(error)) {
    return {
      statusCode: 400,
      body: createErrorResponse({
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: error.message ?? "Request validation failed.",
        details: {
          requestId,
          source: error.validationContext ?? "request",
          issues: error.validation
        }
      }),
      shouldLog: false
    };
  }

  return {
    statusCode: 500,
    body: createErrorResponse({
      code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred.",
      details: {
        requestId
      }
    }),
    shouldLog: true
  };
}

export function registerApiErrorHandling(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send(
      createErrorResponse({
        code: API_ERROR_CODES.NOT_FOUND,
        message: "Route not found.",
        details: {
          requestId: request.id,
          method: request.method,
          url: request.url
        }
      })
    );
  });

  app.setErrorHandler((error, request, reply) => {
    const normalized = normalizeApiError(error, request.id);

    if (normalized.shouldLog) {
      request.log.error(
        {
          err: error,
          requestId: request.id
        },
        "Unhandled API error"
      );
    } else {
      request.log.warn(
        {
          requestId: request.id,
          statusCode: normalized.statusCode
        },
        "API request failed with a handled client error"
      );
    }

    return reply.status(normalized.statusCode).send(normalized.body);
  });
}