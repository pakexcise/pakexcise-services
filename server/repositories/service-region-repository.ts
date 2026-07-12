import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class ServiceRegionRepository extends Repository {
  async syncForService(serviceId: string, regionIds: string[]): Promise<void> {
    const uniqueRegionIds = [...new Set(regionIds)];

    await this.db.serviceRegion.deleteMany({
      where: { serviceId }});

    if (uniqueRegionIds.length === 0) {
      await this.db.service.update({
        where: { id: serviceId },
        data: { regionId: null }});
      return;
    }

    await this.db.serviceRegion.createMany({
      data: uniqueRegionIds.map((regionId, index) => ({
        serviceId,
        regionId,
        displayOrder: index,
        isActive: true}))});

    await this.db.service.update({
      where: { id: serviceId },
      data: { regionId: uniqueRegionIds[0] }});
  }

  async listRegionIdsForService(serviceId: string): Promise<string[]> {
    const rows = await this.db.serviceRegion.findMany({
      where: { serviceId, isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { regionId: true }});

    return rows.map((row) => row.regionId);
  }

  async migrateLegacyRegionAssignments(): Promise<void> {
    const services = await this.db.service.findMany({
      where: {
        regionId: { not: null },
        serviceRegions: { none: {} }},
      select: { id: true, regionId: true }});

    for (const service of services) {
      if (!service.regionId) {
        continue;
      }

      await this.syncForService(service.id, [service.regionId]);
    }
  }
  async listMatrixData(): Promise<{
    services: Array<{ id: string; nameEn: string; slug: string }>;
    regions: Array<{ id: string; nameEn: string; slug: string }>;
    assignments: Record<string, string[]>;
  }> {
    const [services, regions, serviceRegions] = await Promise.all([
      this.db.service.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
        select: { id: true, nameEn: true, slug: true }}),
      this.db.region.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
        select: { id: true, nameEn: true, slug: true }}),
      this.db.serviceRegion.findMany({
        where: { isActive: true },
        select: { serviceId: true, regionId: true }})]);

    const assignments: Record<string, string[]> = {};

    for (const row of serviceRegions) {
      const existing = assignments[row.serviceId] ?? [];
      existing.push(row.regionId);
      assignments[row.serviceId] = existing;
    }

    return { services, regions, assignments };
  }
}

export const serviceRegionRepository = new ServiceRegionRepository();
