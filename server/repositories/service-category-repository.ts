import "server-only";

import type { Prisma } from "@prisma/client";

import {
  activeOnly,
  publicServiceSelect,
  Repository,
} from "@/server/repositories/base/repository";

const publicCategorySelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  descriptionEn: true,
  descriptionUr: true,
  displayOrder: true,
} as const satisfies Prisma.ServiceCategorySelect;

export type PublicServiceCategory = Prisma.ServiceCategoryGetPayload<{
  select: typeof publicCategorySelect;
}>;

export type PublicServiceCategoryGroup = PublicServiceCategory & {
  services: Prisma.ServiceGetPayload<{
    select: typeof publicServiceSelect;
  }>[];
};

/** ServiceCategory has no soft-delete field — use isActive only. */
const publicCategoryWhere = {
  isActive: true,
} as const satisfies Prisma.ServiceCategoryWhereInput;

const publicTopLevelServiceWhere = {
  ...activeOnly(),
  parentServiceId: null,
  serviceRegions: {
    some: {
      isActive: true,
      region: activeOnly(),
    },
  },
} as const satisfies Prisma.ServiceWhereInput;

const publicTopLevelServiceSelect = {
  ...publicServiceSelect,
  categoryId: true,
} as const satisfies Prisma.ServiceSelect;

export class ServiceCategoryRepository extends Repository {
  async listPublicGrouped(): Promise<PublicServiceCategoryGroup[]> {
    return this.query(async () => {
      const services = await this.db.service.findMany({
        where: publicTopLevelServiceWhere,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: publicTopLevelServiceSelect,
      });

      if (services.length === 0) {
        return [];
      }

      const categoryIds = [
        ...new Set(
          services
            .map((service) => service.categoryId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      const categories =
        categoryIds.length > 0
          ? await this.db.serviceCategory.findMany({
              where: {
                ...publicCategoryWhere,
                id: { in: categoryIds },
              },
              orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
              select: publicCategorySelect,
            })
          : [];

      const grouped = categories.map((category) => ({
        ...category,
        services: services
          .filter((service) => service.categoryId === category.id)
          .map(({ categoryId: _categoryId, ...service }) => service),
      }));

      const uncategorized = services
        .filter((service) => !service.categoryId)
        .map(({ categoryId: _categoryId, ...service }) => service);

      if (uncategorized.length > 0) {
        grouped.push({
          id: "uncategorized",
          slug: "other-services",
          nameEn: "Other services",
          nameUr: "دیگر خدمات",
          descriptionEn: null,
          descriptionUr: null,
          displayOrder: 9999,
          services: uncategorized,
        });
      }

      return grouped.filter((group) => group.services.length > 0);
    }, []);
  }
}

export const serviceCategoryRepository = new ServiceCategoryRepository();
