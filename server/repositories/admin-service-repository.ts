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
  categoryId: true,
  parentServiceId: true,
  serviceRegions: {
    orderBy: { displayOrder: "asc" },
    select: {
      regionId: true,
      region: {
        select: {
          id: true,
          slug: true,
          nameEn: true,
        },
      },
    },
  },
  nameEn: true,
  shortDescriptionEn: true,
  contentEn: true,
  ctaTextEn: true,
  processingNotesEn: true,
  internalNotes: true,
  referenceLinksJson: true,
  requiresProof: true,
  isActive: true,
  isFeatured: true,
  featuredDisplayOrder: true,
  showInFooter: true,
  footerDisplayOrder: true,
  displayOrder: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  region: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
  category: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
  parentService: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
  seoMeta: true,
  documentReqs: {
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      regionId: true,
      docType: true,
      labelEn: true,
      instructionsEn: true,
      isRequired: true,
      maxSizeBytes: true,
      acceptedMimeTypes: true,
      displayOrder: true,
      isActive: true,
      region: {
        select: {
          id: true,
          slug: true,
          nameEn: true,
        },
      },
    },
  },
  formFields: {
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      fieldKey: true,
      labelEn: true,
      placeholderEn: true,
      helpTextEn: true,
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
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  deletedAt: true,
  category: {
    select: {
      nameEn: true,
    },
  },
  parentService: {
    select: {
      nameEn: true,
    },
  },
  serviceRegions: {
    orderBy: { displayOrder: "asc" },
    select: {
      region: {
        select: {
          id: true,
          nameEn: true,
        },
      },
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
      where.serviceRegions = {
        some: {
          regionId: filters.regionId,
          isActive: true,
        },
      };
    }

    if (filters.q?.trim()) {
      const query = filters.q.trim();
      where.OR = [
        { slug: { contains: query, mode: "insensitive" } },
        { nameEn: { contains: query, mode: "insensitive" } },

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

  async listOptions(): Promise<
    Array<{ id: string; nameEn: string; slug: string }>
  > {
    return this.db.service.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: { id: true, nameEn: true, slug: true },
    });
  }
}

export const adminServiceRepository = new AdminServiceRepository();
