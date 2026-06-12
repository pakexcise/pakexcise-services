import "server-only";

import type { Prisma } from "@prisma/client";

import {
  activeOnly,
  isActiveOnly,
  publicServiceSelect,
  publicServiceWhere,
  Repository,
  type PaginatedResult,
  type PublicServiceSelect,
} from "@/server/repositories/base/repository";

export type { PublicServiceSelect as PublicServiceCard };

const publicFormFieldSelect = {
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
} as const;

const publicDocumentRequirementSelect = {
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
} as const;

const publicAssignedRegionsSelect = {
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
  serviceRegions: publicAssignedRegionsSelect,
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
    serviceRegions: {
      some: {
        regionId,
        isActive: true,
        region: activeOnly(),
      },
    },
  };
}

export class ServiceRepository extends Repository {
  async listPublic(limit = 6): Promise<PublicServiceSelect[]> {
    return this.query(
      () =>
        this.db.service.findMany({
          where: publicServiceWhere,
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
          where: publicServiceWhere,
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          skip,
          take,
          select: publicServiceSelect,
        }),
      () => this.db.service.count({ where: publicServiceWhere }),
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
            ...activeOnly(),
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
      const assignments = await this.db.serviceRegion.findMany({
        where: { serviceId, isActive: true },
        select: { regionId: true },
      });
      const regionIds = assignments.map((entry) => entry.regionId);

      if (regionIds.length === 0) {
        return [];
      }

      return this.db.service.findMany({
        where: {
          id: { not: serviceId },
          ...activeOnly(),
          serviceRegions: {
            some: {
              regionId: { in: regionIds },
              isActive: true,
              region: activeOnly(),
            },
          },
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        take: limit,
        select: publicServiceSelect,
      });
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
}

export const serviceRepository = new ServiceRepository();

export async function getActiveServices(limit = 6): Promise<PublicServiceSelect[]> {
  return serviceRepository.listPublic(limit);
}

export async function listPublicServices(
  limit = 50,
): Promise<PublicServiceSelect[]> {
  return serviceRepository.listPublic(limit);
}
