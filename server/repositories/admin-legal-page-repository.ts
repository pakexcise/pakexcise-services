import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminLegalPageListSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleUr: true,
  isPublished: true,
  isActive: true,
  displayOrder: true,
  publishedAt: true,
  updatedAt: true,
} as const satisfies Prisma.LegalPageSelect;

export const adminLegalPageDetailSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleUr: true,
  excerptEn: true,
  excerptUr: true,
  contentEn: true,
  contentUr: true,
  isPublished: true,
  isActive: true,
  displayOrder: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  seoMeta: true,
} as const satisfies Prisma.LegalPageSelect;

export type AdminLegalPageListItem = Prisma.LegalPageGetPayload<{
  select: typeof adminLegalPageListSelect;
}>;

export type AdminLegalPageDetail = Prisma.LegalPageGetPayload<{
  select: typeof adminLegalPageDetailSelect;
}>;

export type AdminLegalPageListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "published" | "draft" | "all";
  active?: "active" | "inactive" | "all";
};

export class AdminLegalPageRepository extends Repository {
  buildListWhere(filters: AdminLegalPageListFilters): Prisma.LegalPageWhereInput {
    const where: Prisma.LegalPageWhereInput = {};

    if (filters.status === "published") {
      where.isPublished = true;
    } else if (filters.status === "draft") {
      where.isPublished = false;
    }

    if (filters.active === "active") {
      where.isActive = true;
    } else if (filters.active === "inactive") {
      where.isActive = false;
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { titleEn: { contains: q, mode: "insensitive" } },
        { titleUr: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async listPaginated(
    filters: AdminLegalPageListFilters,
  ): Promise<PaginatedResult<AdminLegalPageListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.legalPage.findMany({
          where,
          skip,
          take,
          orderBy: [{ displayOrder: "asc" }, { titleEn: "asc" }],
          select: adminLegalPageListSelect,
        }),
      () => this.db.legalPage.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string): Promise<AdminLegalPageDetail | null> {
    return this.db.legalPage.findUnique({
      where: { id },
      select: adminLegalPageDetailSelect,
    });
  }

  async findBySlug(slug: string): Promise<AdminLegalPageDetail | null> {
    return this.db.legalPage.findUnique({
      where: { slug },
      select: adminLegalPageDetailSelect,
    });
  }

  async getNextDisplayOrder(): Promise<number> {
    const latest = await this.db.legalPage.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    return (latest?.displayOrder ?? -1) + 1;
  }
}

export const adminLegalPageRepository = new AdminLegalPageRepository();
