import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminServiceDetailSelect = {
  id: true,
  slug: true,
  regionId: true,
  nameEn: true,
  nameUr: true,
  shortDescriptionEn: true,
  shortDescriptionUr: true,
  contentEn: true,
  contentUr: true,
  ctaTextEn: true,
  ctaTextUr: true,
  processingNotesEn: true,
  processingNotesUr: true,
  requiresProof: true,
  isActive: true,
  displayOrder: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  region: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
  seoMeta: true,
  documentReqs: {
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      docType: true,
      labelEn: true,
      labelUr: true,
      instructionsEn: true,
      instructionsUr: true,
      isRequired: true,
      maxSizeBytes: true,
      acceptedMimeTypes: true,
      displayOrder: true,
      isActive: true,
    },
  },
  formFields: {
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      fieldKey: true,
      labelEn: true,
      labelUr: true,
      placeholderEn: true,
      placeholderUr: true,
      helpTextEn: true,
      helpTextUr: true,
      fieldType: true,
      isRequired: true,
      isEncrypted: true,
      optionsJson: true,
      validationJson: true,
      conditionalJson: true,
      displayOrder: true,
      isActive: true,
    },
  },
} as const satisfies Prisma.ServiceSelect;

export type AdminServiceDetail = Prisma.ServiceGetPayload<{
  select: typeof adminServiceDetailSelect;
}>;

export const adminServiceListSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  deletedAt: true,
  region: {
    select: {
      id: true,
      nameEn: true,
      nameUr: true,
    },
  },
} as const satisfies Prisma.ServiceSelect;

export type AdminServiceListItem = Prisma.ServiceGetPayload<{
  select: typeof adminServiceListSelect;
}>;

export type AdminServiceListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  regionId?: string;
  active?: "true" | "false" | "all";
};

export class AdminServiceRepository extends Repository {
  buildListWhere(filters: AdminServiceListFilters): Prisma.ServiceWhereInput {
    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
    };

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.regionId) {
      where.regionId = filters.regionId;
    }

    if (filters.q?.trim()) {
      const query = filters.q.trim();
      where.OR = [
        { slug: { contains: query, mode: "insensitive" } },
        { nameEn: { contains: query, mode: "insensitive" } },
        { nameUr: { contains: query, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async listPaginated(
    filters: AdminServiceListFilters = {},
  ): Promise<PaginatedResult<AdminServiceListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.service.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          skip,
          take,
          select: adminServiceListSelect,
        }),
      () => this.db.service.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string): Promise<AdminServiceDetail | null> {
    return this.db.service.findFirst({
      where: { id, deletedAt: null },
      select: adminServiceDetailSelect,
    });
  }

  async findBySlug(slug: string): Promise<{ id: string; slug: string } | null> {
    return this.db.service.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, slug: true },
    });
  }

  async listForSelect() {
    return this.db.service.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameUr: true,
      },
    });
  }

  async getNextDisplayOrder(): Promise<number> {
    const last = await this.db.service.findFirst({
      where: { deletedAt: null },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    return (last?.displayOrder ?? 0) + 1;
  }
}

export const adminServiceRepository = new AdminServiceRepository();
