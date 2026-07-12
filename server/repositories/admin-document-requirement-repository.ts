import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminDocumentRequirementListSelect = {
  id: true,
  docType: true,
  labelEn: true,
  isRequired: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  service: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
  region: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
} as const satisfies Prisma.DocumentRequirementSelect;

export type AdminDocumentRequirementListItem = Prisma.DocumentRequirementGetPayload<{
  select: typeof adminDocumentRequirementListSelect;
}>;

export type AdminDocumentRequirementListFilters = {
  page?: number;
  pageSize?: number;
  serviceId?: string;
  regionId?: string;
  q?: string;
  active?: "true" | "false" | "all";
};

export class AdminDocumentRequirementRepository extends Repository {
  buildListWhere(
    filters: AdminDocumentRequirementListFilters,
  ): Prisma.DocumentRequirementWhereInput {
    const where: Prisma.DocumentRequirementWhereInput = {};

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters.regionId) {
      where.regionId = filters.regionId;
    }

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.q) {
      where.OR = [
        { docType: { contains: filters.q, mode: "insensitive" } },
        { labelEn: { contains: filters.q, mode: "insensitive" } },

        {
          service: {
            nameEn: { contains: filters.q, mode: "insensitive" },
          },
        },
      ];
    }

    return where;
  }

  listPaginated(
    filters: AdminDocumentRequirementListFilters = {},
  ): Promise<PaginatedResult<AdminDocumentRequirementListItem>> {
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.documentRequirement.findMany({
          where,
          orderBy: [
            { service: { displayOrder: "asc" } },
            { displayOrder: "asc" },
            { labelEn: "asc" },
          ],
          skip,
          take,
          select: adminDocumentRequirementListSelect,
        }),
      () => this.db.documentRequirement.count({ where }),
      filters,
    );
  }
}

export const adminDocumentRequirementRepository =
  new AdminDocumentRequirementRepository();
