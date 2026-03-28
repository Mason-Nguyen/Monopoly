export const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiPaginationMeta {
  limit: number;
  offset: number;
  total?: number;
}

export interface ApiResponseMeta {
  requestId?: string;
  pagination?: ApiPaginationMeta;
}

export interface ApiSuccessResponse<TData, TMeta = ApiResponseMeta> {
  success: true;
  data: TData;
  meta?: TMeta;
}

export interface ApiErrorShape<TDetails = unknown> {
  code: ApiErrorCode;
  message: string;
  details?: TDetails;
}

export interface ApiErrorResponse<TDetails = unknown> {
  success: false;
  error: ApiErrorShape<TDetails>;
}

export type ApiResponse<TData, TMeta = ApiResponseMeta, TDetails = unknown> =
  | ApiSuccessResponse<TData, TMeta>
  | ApiErrorResponse<TDetails>;

export function createSuccessResponse<TData, TMeta = ApiResponseMeta>(
  data: TData,
  meta?: TMeta
): ApiSuccessResponse<TData, TMeta> {
  if (typeof meta === "undefined") {
    return {
      success: true,
      data
    };
  }

  return {
    success: true,
    data,
    meta
  };
}

export function createErrorResponse<TDetails = unknown>(
  error: ApiErrorShape<TDetails>
): ApiErrorResponse<TDetails> {
  return {
    success: false,
    error
  };
}