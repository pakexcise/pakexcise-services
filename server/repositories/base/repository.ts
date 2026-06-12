import "server-only";

import type { Prisma } from "@prisma/client";

import { safeDbQuery } from "@/server/db/safe-query";
import { prisma } from "@/server/db/prisma";

export abstract class Repository {
  protected readonly db = prisma;

  protected query<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    return safeDbQuery(operation, fallback);
  }

  protected paginateQuery<T>(
    findMany: (args: { skip: number; take: number }) => Promise<T[]>,
    count: () => Promise<number>,
    input: PaginationInput = {},
  ): Promise<PaginatedResult<T>> {
    return this.query(
      () => paginate(findMany, count, input),
      emptyPaginatedResult<T>(input),
    );
  }
}

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function resolvePagination(input: PaginationInput = {}): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip, take: pageSize };
}

export function emptyPaginatedResult<T>(
  input: PaginationInput = {},
): PaginatedResult<T> {
  const { page, pageSize } = resolvePagination(input);

  return {
    items: [],
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  };
}

export async function paginate<T>(
  findMany: (args: { skip: number; take: number }) => Promise<T[]>,
  count: () => Promise<number>,
  input: PaginationInput = {},
): Promise<PaginatedResult<T>> {
  const { page, pageSize, skip, take } = resolvePagination(input);
  const [items, total] = await Promise.all([
    findMany({ skip, take }),
    count(),
  ]);

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function activeOnly<T extends { isActive?: boolean; deletedAt?: Date | null }>(
  where: T = {} as T,
): T & { isActive: boolean; deletedAt: null } {
  return {
    ...where,
    isActive: true,
    deletedAt: null,
  };
}

/** For models with isActive but no soft-delete (deletedAt) field. */
export function isActiveOnly<T extends { isActive?: boolean }>(
  where: T = {} as T,
): T & { isActive: boolean } {
  return {
    ...where,
    isActive: true,
  };
}

const publicServiceRegionSelect = {
  where: { isActive: true },
  orderBy: { displayOrder: "asc" },
  select: {
    region: {
      select: {
        slug: true,
        nameEn: true,
        nameUr: true,
      },
    },
  },
} as const satisfies Prisma.ServiceRegionFindManyArgs;

export type PublicServiceSelect = Prisma.ServiceGetPayload<{
  select: {
    id: true;
    slug: true;
    nameEn: true;
    nameUr: true;
    shortDescriptionEn: true;
    shortDescriptionUr: true;
    requiresProof: true;
    displayOrder: true;
    serviceRegions: typeof publicServiceRegionSelect;
  };
}>;

export const publicServiceSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  shortDescriptionEn: true,
  shortDescriptionUr: true,
  requiresProof: true,
  displayOrder: true,
  serviceRegions: publicServiceRegionSelect,
} as const satisfies Prisma.ServiceSelect;

export const publicServiceWhere = {
  ...activeOnly(),
  serviceRegions: {
    some: {
      isActive: true,
      region: activeOnly(),
    },
  },
} as const satisfies Prisma.ServiceWhereInput;
