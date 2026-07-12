import "server-only";

import { Repository } from "@/server/repositories/base/repository";
import { activityEventRepository } from "@/server/repositories/activity-event-repository";

export type AdminDashboardInsights = {
  todayApplications: number;
  todayContactInquiries: number;
  todayNewUsers: number;
  todayWhatsappClicks: number;
  todaySignups: number;
  pendingSupportRequests: number;
  paymentUploadedQueue: number;
  mostRequestedService: {
    nameEn: string;
    count: number;
  } | null;
  topProvince: {
    nameEn: string;
    count: number;
  } | null;
};

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export class AdminDashboardRepository extends Repository {
  async getInsights(): Promise<AdminDashboardInsights> {
    const todayStart = startOfTodayUtc();

    const [
      todayApplications,
      todayContactInquiries,
      todayNewUsers,
      todayWhatsappClicks,
      todaySignups,
      pendingSupportRequests,
      paymentUploadedQueue,
      applicationsByService,
    ] = await Promise.all([
      this.db.application.count({
        where: {
          status: { not: "DRAFT" },
          createdAt: { gte: todayStart },
        },
      }),
      this.db.contactInquiry.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.db.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      activityEventRepository.countByEventSince("whatsapp_click", todayStart),
      activityEventRepository.countByEventSince("signup_completed", todayStart),
      this.db.guestLead.count({
        where: { status: "NEW" },
      }),
      this.db.application.count({
        where: { status: "PAYMENT_UPLOADED" },
      }),
      this.db.application.groupBy({
        by: ["serviceId"],
        where: { status: { not: "DRAFT" } },
        _count: { _all: true },
      }),
    ]);

    let mostRequestedService: AdminDashboardInsights["mostRequestedService"] =
      null;

    if (applicationsByService.length > 0) {
      const sortedServices = [...applicationsByService].sort(
        (a, b) => b._count._all - a._count._all,
      );
      const topService = sortedServices[0];
      if (topService) {
        const service = await this.db.service.findUnique({
          where: { id: topService.serviceId },
          select: { nameEn: true },
        });

        if (service) {
          mostRequestedService = {
            nameEn: service.nameEn,
            count: topService._count._all,
          };
        }
      }
    }

    let topProvince: AdminDashboardInsights["topProvince"] = null;

    if (applicationsByService.length > 0) {
      const serviceIds = applicationsByService.map((row) => row.serviceId);
      const services = await this.db.service.findMany({
        where: { id: { in: serviceIds } },
        select: {
          id: true,
          regionId: true,
          serviceRegions: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            take: 1,
            select: { regionId: true },
          },
        },
      });

      const regionCounts = new Map<string, number>();

      for (const row of applicationsByService) {
        const service = services.find((item) => item.id === row.serviceId);
        const regionId =
          service?.serviceRegions[0]?.regionId ?? service?.regionId ?? null;

        if (!regionId) {
          continue;
        }

        regionCounts.set(
          regionId,
          (regionCounts.get(regionId) ?? 0) + row._count._all,
        );
      }

      const topRegionEntry = [...regionCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0];

      if (topRegionEntry) {
        const region = await this.db.region.findUnique({
          where: { id: topRegionEntry[0] },
          select: { nameEn: true },
        });

        if (region) {
          topProvince = {
            nameEn: region.nameEn,
            count: topRegionEntry[1],
          };
        }
      }
    }

    return {
      todayApplications,
      todayContactInquiries,
      todayNewUsers,
      todayWhatsappClicks,
      todaySignups,
      pendingSupportRequests,
      paymentUploadedQueue,
      mostRequestedService,
      topProvince,
    };
  }
}

export const adminDashboardRepository = new AdminDashboardRepository();
