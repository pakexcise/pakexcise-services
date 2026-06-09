import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminRedirectListSelect = {
  id: true,
  oldSlug: true,
  newSlug: true,
  statusCode: true,
  isActive: true,
  updatedAt: true,
} as const satisfies Prisma.RedirectSelect;

export type AdminRedirectListItem = Prisma.RedirectGetPayload<{
  select: typeof adminRedirectListSelect;
}>;

export type AdminRedirectListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  active?: "true" | "false" | "all";
};

export class AdminRedirectRepository extends Repository {
  buildListWhere(filters: AdminRedirectListFilters): Prisma.RedirectWhereInput {
    const where: Prisma.RedirectWhereInput = {};

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { oldSlug: { contains: q, mode: "insensitive" } },
        { newSlug: { contains: q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async listPaginated(
    filters: AdminRedirectListFilters,
  ): Promise<PaginatedResult<AdminRedirectListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.redirect.findMany({
          where,
          orderBy: [{ updatedAt: "desc" }],
          skip,
          take,
          select: adminRedirectListSelect,
        }),
      () => this.db.redirect.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string) {
    return this.db.redirect.findUnique({ where: { id } });
  }
}

export const adminRedirectRepository = new AdminRedirectRepository();
