import type { PrismaClient } from "../../../generated/prisma/client.js";

export type PrismaDatabaseClient = PrismaClient;

export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  limit: number;
  offset: number;
}

export function normalizePaginationOptions(
  options: PaginationOptions = {},
  defaults: Required<PaginationOptions> = {
    limit: 20,
    offset: 0
  }
): Required<PaginationOptions> {
  const limit = Number.isFinite(options.limit)
    ? Math.max(1, Math.min(100, Number(options.limit)))
    : defaults.limit;

  const offset = Number.isFinite(options.offset)
    ? Math.max(0, Number(options.offset))
    : defaults.offset;

  return {
    limit,
    offset
  };
}