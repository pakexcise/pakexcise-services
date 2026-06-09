import "server-only";

import type { Prisma } from "@prisma/client";

import {
  activeOnly,
  isActiveOnly,
  paginate,
  publicServiceSelect,
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

export const publicServiceDetailSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  shortDescriptionEn: true,
  shortDescriptionUr: true,
  contentEn: true,
  contentUr: true,
  requiresProof: true,
  displayOrder: true,
  regionId: true,
  updatedAt: true,
  region: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
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
  region: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
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

export class ServiceRepository extends Repository {
  async listPublic(limit = 6): Promise<PublicServiceSelect[]> {
    return this.query(
      () =>
        this.db.service.findMany({
          where: {
            ...activeOnly(),
            region: activeOnly(),
          },
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
    const where = {
      ...activeOnly(),
      region: activeOnly(),
    };

    return paginate(
      ({ skip, take }) =>
        this.db.service.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          skip,
          take,
          select: publicServiceSelect,
        }),
      () => this.db.service.count({ where }),
      { page, pageSize },
    );
  }

  async listPublicByRegionId(regionId: string): Promise<PublicServiceSelect[]> {
    return this.db.service.findMany({
      where: {
        regionId,
        ...activeOnly(),
        region: activeOnly(),
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: publicServiceSelect,
    });
  }

  async findPublicBySlug(slug: string): Promise<PublicServiceSelect | null> {
    return this.db.service.findFirst({
      where: {
        slug,
        ...activeOnly(),
        region: activeOnly(),
      },
      select: publicServiceSelect,
    });
  }

  async findPublicDetailBySlug(slug: string): Promise<PublicServiceDetail | null> {
    return this.db.service.findFirst({
      where: {
        slug,
        ...activeOnly(),
        region: activeOnly(),
      },
      select: publicServiceDetailSelect,
    });
  }

  async findPublicApplyConfigBySlug(
    slug: string,
  ): Promise<PublicServiceApplyConfig | null> {
    return this.db.service.findFirst({
      where: {
        slug,
        ...activeOnly(),
        region: activeOnly(),
      },
      select: publicServiceApplySelect,
    });
  }

  async listRelatedServices(
    serviceId: string,
    regionId: string,
    limit = 3,
  ): Promise<PublicServiceSelect[]> {
    return this.db.service.findMany({
      where: {
        id: { not: serviceId },
        regionId,
        ...activeOnly(),
        region: activeOnly(),
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: publicServiceSelect,
    });
  }

  async listActiveSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.db.service.findMany({
      where: {
        ...activeOnly(),
        region: activeOnly(),
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
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
