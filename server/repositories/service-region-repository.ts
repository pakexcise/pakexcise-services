import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class ServiceRegionRepository extends Repository {
  async syncForService(serviceId: string, regionIds: string[]): Promise<void> {
    const uniqueRegionIds = [...new Set(regionIds)];

    await this.db.serviceRegion.deleteMany({
      where: { serviceId },
    });

    if (uniqueRegionIds.length === 0) {
      await this.db.service.update({
        where: { id: serviceId },
        data: { regionId: null },
      });
      return;
    }

    await this.db.serviceRegion.createMany({
      data: uniqueRegionIds.map((regionId, index) => ({
        serviceId,
        regionId,
        displayOrder: index,
        isActive: true,
      })),
    });

    await this.db.service.update({
      where: { id: serviceId },
      data: { regionId: uniqueRegionIds[0] },
    });
  }

  async listRegionIdsForService(serviceId: string): Promise<string[]> {
    const rows = await this.db.serviceRegion.findMany({
      where: { serviceId, isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { regionId: true },
    });

    return rows.map((row) => row.regionId);
  }

  async migrateLegacyRegionAssignments(): Promise<void> {
    const services = await this.db.service.findMany({
      where: {
        regionId: { not: null },
        serviceRegions: { none: {} },
      },
      select: { id: true, regionId: true },
    });

    for (const service of services) {
      if (!service.regionId) {
        continue;
      }

      await this.syncForService(service.id, [service.regionId]);
    }
  }
}

export const serviceRegionRepository = new ServiceRegionRepository();
