export interface ApiPaginationMeta {
  limit: number;
  offset: number;
  total?: number;
  returnedCount?: number;
}

export interface ApiResponseMeta {
  requestId?: string;
  pagination?: ApiPaginationMeta;
  [key: string]: unknown;
}

interface ApiSuccessEnvelope<TData> {
  success: true;
  data: TData;
  meta?: ApiResponseMeta;
}

interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: {
      statusCode: number;
      code: string;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:3001";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getApiBaseUrl(): string {
  const configuredValue = import.meta.env.VITE_API_BASE_URL;

  if (typeof configuredValue === "string" && configuredValue.trim().length > 0) {
    return trimTrailingSlash(configuredValue.trim());
  }

  return DEFAULT_API_BASE_URL;
}

function buildUrl(path: string, query?: Record<string, string | number | null | undefined>): string {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || typeof value === "undefined") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function isApiSuccessEnvelope<TData>(value: unknown): value is ApiSuccessEnvelope<TData> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as { success?: unknown }).success === true &&
    "data" in value
  );
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as { success?: unknown }).success === false &&
    "error" in value
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  const bodyText = await response.text();

  if (bodyText.length === 0) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(bodyText) as unknown;
  }

  return bodyText;
}

export async function apiGet<TData>(
  path: string,
  query?: Record<string, string | number | null | undefined>
): Promise<ApiSuccessEnvelope<TData>> {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      Accept: "application/json"
    }
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    if (isApiErrorEnvelope(body)) {
      throw new ApiClientError(body.error.message, {
        statusCode: response.status,
        code: body.error.code,
        details: body.error.details
      });
    }

    throw new ApiClientError("The API request failed.", {
      statusCode: response.status,
      code: "HTTP_ERROR",
      details: body
    });
  }

  if (!isApiSuccessEnvelope<TData>(body)) {
    throw new ApiClientError("The API returned an invalid success envelope.", {
      statusCode: response.status,
      code: "INVALID_SUCCESS_ENVELOPE",
      details: body
    });
  }

  return body;
}