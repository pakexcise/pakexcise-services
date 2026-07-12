import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminGuideListSelect = {
  id: true,
  slug: true,
  titleEn: true,
  isPublished: true,
  publishedAt: true,
  updatedAt: true,
} as const satisfies Prisma.GuideSelect;

export const adminGuideDetailSelect = {
  id: true,
  slug: true,
  titleEn: true,
  excerptEn: true,
  contentEn: true,
  relatedServiceIds: true,
  attachedFaqIds: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  seoMeta: true,
} as const satisfies Prisma.GuideSelect;

export type AdminGuideListItem = Prisma.GuideGetPayload<{
  select: typeof adminGuideListSelect;
}>;

export type AdminGuideDetail = Prisma.GuideGetPayload<{
  select: typeof adminGuideDetailSelect;
}>;

export type AdminGuideListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "published" | "draft" | "all";
};

export class AdminGuideRepository extends Repository {
  buildListWhere(filters: AdminGuideListFilters): Prisma.GuideWhereInput {
    const where: Prisma.GuideWhereInput = {};

    if (filters.status === "published") {
      where.isPublished = true;
    } else if (filters.status === "draft") {
      where.isPublished = false;
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { titleEn: { contains: q, mode: "insensitive" } },

        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async listPaginated(
    filters: AdminGuideListFilters,
  ): Promise<PaginatedResult<AdminGuideListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.guide.findMany({
          where,
          orderBy: [{ updatedAt: "desc" }],
          skip,
          take,
          select: adminGuideListSelect,
        }),
      () => this.db.guide.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string): Promise<AdminGuideDetail | null> {
    return this.db.guide.findUnique({
      where: { id },
      select: adminGuideDetailSelect,
    });
  }

  async findBySlug(slug: string) {
    return this.db.guide.findUnique({
      where: { slug },
      select: { id: true },
    });
  }
}

export const adminGuideRepository = new AdminGuideRepository();
