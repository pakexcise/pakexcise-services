import "server-only";

import {
  activeOnly,
  paginate,
  publicServiceSelect,
  Repository,
  type PaginatedResult,
  type PublicServiceSelect,
} from "@/server/repositories/base/repository";

export type { PublicServiceSelect as PublicServiceCard };

export class ServiceRepository extends Repository {
  async listPublic(limit = 6): Promise<PublicServiceSelect[]> {
    return this.db.service.findMany({
      where: {
        ...activeOnly(),
        region: activeOnly(),
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: publicServiceSelect,
    });
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
}

export const serviceRepository = new ServiceRepository();

export async function getActiveServices(limit = 6): Promise<PublicServiceSelect[]> {
  return serviceRepository.listPublic(limit);
}
