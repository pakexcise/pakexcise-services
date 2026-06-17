import "server-only";

import type { Prisma } from "@prisma/client";

import {
  activeOnly,
  isActiveOnly,
  publicServiceSelect,
  Repository,
  type PaginatedResult,
  type PublicServiceSelect,
} from "@/server/repositories/base/repository";

export type { PublicServiceSelect as PublicServiceCard };

const publicFormFieldSelect = {
  id: true,
  regionId: true,
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
  region: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
} as const;

const publicDocumentRequirementSelect = {
  id: true,
  docType: true,
  kind: true,
  regionId: true,
  labelEn: true,
  labelUr: true,
  instructionsEn: true,
  instructionsUr: true,
  isRequired: true,
  maxSizeBytes: true,
  acceptedMimeTypes: true,
  displayOrder: true,
  region: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
} as const;

const publicAssignedRegionsSelect = {
  where: { isActive: true },
  orderBy: { displayOrder: "asc" },
  select: {
    supportNotesEn: true,
    supportNotesUr: true,
    region: {
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameUr: true,
      },
    },
  },
} as const satisfies Prisma.ServiceRegionFindManyArgs;

const publicCategorySelect = {
  slug: true,
  nameEn: true,
  nameUr: true,
} as const;

const publicSubServiceSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  shortDescriptionEn: true,
  shortDescriptionUr: true,
  displayOrder: true,
} as const;

export const publicServiceWhere = {
  ...activeOnly(),
  serviceRegions: {
    some: {
      isActive: true,
      region: activeOnly(),
    },
  },
} as const satisfies Prisma.ServiceWhereInput;

export const publicTopLevelServiceWhere = {
  ...publicServiceWhere,
  parentServiceId: null,
} as const satisfies Prisma.ServiceWhereInput;

export const publicServiceDetailSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  shortDescriptionEn: true,
  shortDescriptionUr: true,
  contentEn: true,
  contentUr: true,
  processingNotesEn: true,
  processingNotesUr: true,
  requiresProof: true,
  displayOrder: true,
  updatedAt: true,
  categoryId: true,
  parentServiceId: true,
  category: {
    select: publicCategorySelect,
  },
  parentService: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
  subServices: {
    where: {
      ...activeOnly(),
      serviceRegions: {
        some: {
          isActive: true,
          region: activeOnly(),
        },
      },
    },
    orderBy: { displayOrder: "asc" },
    select: publicSubServiceSelect,
  },
  serviceRegions: publicAssignedRegionsSelect,
  formFields: {
    where: isActiveOnly(),
    orderBy: { displayOrder: "asc" },
    select: publicFormFieldSelect,
  },
  documentReqs: {
    where: isActiveOnly(),
    orderBy: { displayOrder: "asc" },
    select: publicDocumentRequirementSelect,
  },
  seoMeta: true,
} as const satisfies Prisma.ServiceSelect;

export type PublicServiceDetail = Prisma.ServiceGetPayload<{
  select: typeof publicServiceDetailSelect;
}>;

export const publicServiceApplySelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  shortDescriptionEn: true,
  shortDescriptionUr: true,
  requiresProof: true,
  serviceRegions: publicAssignedRegionsSelect,
  formFields: {
    where: isActiveOnly(),
    orderBy: { displayOrder: "asc" },
    select: publicFormFieldSelect,
  },
  documentReqs: {
    where: isActiveOnly(),
    orderBy: { displayOrder: "asc" },
    select: publicDocumentRequirementSelect,
  },
} as const satisfies Prisma.ServiceSelect;

export type PublicServiceApplyConfig = Prisma.ServiceGetPayload<{
  select: typeof publicServiceApplySelect;
}>;

function regionAssignedWhere(regionId: string): Prisma.ServiceWhereInput {
  return {
    ...activeOnly(),
    OR: [
      {
        serviceRegions: {
          some: {
            regionId,
            isActive: true,
            region: activeOnly(),
          },
        },
      },
      {
        parentService: {
          serviceRegions: {
            some: {
              regionId,
              isActive: true,
              region: activeOnly(),
            },
          },
        },
      },
    ],
  };
}

export class ServiceRepository extends Repository {
  async listFeatured(limit = 8): Promise<PublicServiceSelect[]> {
    return this.query(
      () =>
        this.db.service.findMany({
          where: {
            ...publicTopLevelServiceWhere,
            isFeatured: true,
          },
          orderBy: [
            { featuredDisplayOrder: "asc" },
            { displayOrder: "asc" },
            { createdAt: "desc" },
          ],
          take: limit,
          select: publicServiceSelect,
        }),
      [],
    );
  }

  async listPublic(limit = 6): Promise<PublicServiceSelect[]> {
    return this.query(
      () =>
        this.db.service.findMany({
          where: publicTopLevelServiceWhere,
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          take: limit,
          select: publicServiceSelect,
        }),
      [],
    );
  }

  async listPublicPaginated(
    page = 1,
    pageSize = 12,
  ): Promise<PaginatedResult<PublicServiceSelect>> {
    return this.paginateQuery(
      ({ skip, take }) =>
        this.db.service.findMany({
          where: publicTopLevelServiceWhere,
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          skip,
          take,
          select: publicServiceSelect,
        }),
      () => this.db.service.count({ where: publicTopLevelServiceWhere }),
      { page, pageSize },
    );
  }

  async listPublicByRegionId(regionId: string): Promise<PublicServiceSelect[]> {
    return this.query(
      () =>
        this.db.service.findMany({
          where: regionAssignedWhere(regionId),
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          select: publicServiceSelect,
        }),
      [],
    );
  }

  async findPublicBySlug(slug: string): Promise<PublicServiceSelect | null> {
    return this.query(
      () =>
        this.db.service.findFirst({
          where: {
            slug,
            ...publicServiceWhere,
          },
          select: publicServiceSelect,
        }),
      null,
    );
  }

  async findPublicDetailBySlug(slug: string): Promise<PublicServiceDetail | null> {
    return this.query(
      () =>
        this.db.service.findFirst({
          where: {
            slug,
            ...publicServiceWhere,
          },
          select: publicServiceDetailSelect,
        }),
      null,
    );
  }

  async findPublicApplyConfigBySlug(
    slug: string,
  ): Promise<PublicServiceApplyConfig | null> {
    return this.query(
      () =>
        this.db.service.findFirst({
          where: {
            slug,
            ...publicServiceWhere,
          },
          select: publicServiceApplySelect,
        }),
      null,
    );
  }

  async listRelatedServices(
    serviceId: string,
    limit = 3,
  ): Promise<PublicServiceSelect[]> {
    return this.query(async () => {
      const current = await this.db.service.findUnique({
        where: { id: serviceId },
        select: {
          categoryId: true,
          serviceRegions: {
            where: { isActive: true },
            select: { regionId: true },
          },
        },
      });

      if (!current) {
        return [];
      }

      const regionIds = current.serviceRegions.map((entry) => entry.regionId);

      const categoryMatches =
        current.categoryId !== null
          ? await this.db.service.findMany({
              where: {
                id: { not: serviceId },
                categoryId: current.categoryId,
                parentServiceId: null,
                ...publicServiceWhere,
              },
              orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
              take: limit,
              select: publicServiceSelect,
            })
          : [];

      if (categoryMatches.length >= limit) {
        return categoryMatches.slice(0, limit);
      }

      if (regionIds.length === 0) {
        return categoryMatches;
      }

      const regionMatches = await this.db.service.findMany({
        where: {
          id: {
            notIn: [serviceId, ...categoryMatches.map((service) => service.id)],
          },
          parentServiceId: null,
          ...publicServiceWhere,
          serviceRegions: {
            some: {
              regionId: { in: regionIds },
              isActive: true,
              region: activeOnly(),
            },
          },
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        take: limit - categoryMatches.length,
        select: publicServiceSelect,
      });

      return [...categoryMatches, ...regionMatches];
    }, []);
  }

  async listActiveSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.query(
      () =>
        this.db.service.findMany({
          where: publicServiceWhere,
          select: {
            slug: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
      [],
    );
  }

  async listParentOptions(): Promise<
    Array<{ id: string; slug: string; nameEn: string; nameUr: string }>
  > {
    return this.query(
      () =>
        this.db.service.findMany({
          where: {
            deletedAt: null,
            parentServiceId: null,
          },
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameUr: true,
          },
        }),
      [],
    );
  }
}

export const serviceRepository = new ServiceRepository();

export async function getFeaturedServices(
  limit = 6,
): Promise<PublicServiceSelect[]> {
  const cappedLimit = Math.min(6, Math.max(1, limit));
  const featured = await serviceRepository.listFeatured(cappedLimit);
  if (featured.length > 0) {
    return featured;
  }

  return serviceRepository.listPublic(limit);
}

export async function getActiveServices(limit = 6): Promise<PublicServiceSelect[]> {
  return serviceRepository.listPublic(limit);
}

export async function listPublicServices(
  limit = 50,
): Promise<PublicServiceSelect[]> {
  return serviceRepository.listPublic(limit);
}
