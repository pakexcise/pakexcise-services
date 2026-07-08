import "server-only";

import type { ActivityEventName } from "@/features/tracking/events";
import { Repository } from "@/server/repositories/base/repository";

export type AdminAnalyticsPeriod = 7 | 30;

export type AdminAnalyticsSummary = {
  periodDays: AdminAnalyticsPeriod;
  eventCounts: Array<{ event: string; count: number }>;
  whatsappByPlacement: Array<{ placement: string; count: number }>;
  trafficByChannel: Array<{ channel: string; count: number }>;
  trafficByPlatform: Array<{ platform: string; count: number }>;
  topLandingPages: Array<{ path: string; count: number }>;
  conversionHighlights: {
    pageViews: number;
    whatsappClicks: number;
    signups: number;
    applicationsSubmitted: number;
    contactSubmissions: number;
  };
};

type MetadataRecord = Record<string, unknown>;

function startOfPeriod(days: AdminAnalyticsPeriod): Date {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);
  return since;
}

function readMetadataString(metadata: unknown, key: string): string | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }

  const value = (metadata as MetadataRecord)[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 120);
  }

  return undefined;
}

function incrementCount(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function toSortedRows(map: Map<string, number>, limit = 12) {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ key, count }) => ({ key, count }));
}

export class AdminAnalyticsRepository extends Repository {
  async getSummary(periodDays: AdminAnalyticsPeriod): Promise<AdminAnalyticsSummary> {
    const since = startOfPeriod(periodDays);

    const [groupedEvents, detailEvents] = await Promise.all([
      this.db.activityEvent.groupBy({
        by: ["event"],
        where: {
          environment: "production",
          createdAt: { gte: since },
        },
        _count: { _all: true },
      }),
      this.db.activityEvent.findMany({
        where: {
          environment: "production",
          createdAt: { gte: since },
          event: {
            in: ["page_view", "whatsapp_click"],
          },
        },
        select: {
          event: true,
          path: true,
          metadata: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
    ]);

    const whatsappByPlacement = new Map<string, number>();
    const trafficByChannel = new Map<string, number>();
    const trafficByPlatform = new Map<string, number>();
    const topLandingPages = new Map<string, number>();

    for (const row of detailEvents) {
      if (row.event === "whatsapp_click") {
        const placement =
          readMetadataString(row.metadata, "placement") ?? "unknown";
        incrementCount(whatsappByPlacement, placement);
        continue;
      }

      if (row.event === "page_view") {
        const channel =
          readMetadataString(row.metadata, "traffic_channel") ?? "unknown";
        const platform =
          readMetadataString(row.metadata, "traffic_platform") ?? "unknown";
        const path = row.path?.split("?")[0]?.slice(0, 200) ?? "/";

        incrementCount(trafficByChannel, channel);
        incrementCount(trafficByPlatform, platform);
        incrementCount(topLandingPages, path);
      }
    }

    const eventCountMap = new Map<string, number>(
      groupedEvents.map((row) => [row.event, row._count._all]),
    );

    const countFor = (event: ActivityEventName): number =>
      eventCountMap.get(event) ?? 0;

    return {
      periodDays,
      eventCounts: groupedEvents
        .map((row) => ({
          event: row.event,
          count: row._count._all,
        }))
        .sort((a, b) => b.count - a.count),
      whatsappByPlacement: toSortedRows(whatsappByPlacement).map(
        ({ key, count }) => ({
          placement: key,
          count,
        }),
      ),
      trafficByChannel: toSortedRows(trafficByChannel).map(({ key, count }) => ({
        channel: key,
        count,
      })),
      trafficByPlatform: toSortedRows(trafficByPlatform).map(({ key, count }) => ({
        platform: key,
        count,
      })),
      topLandingPages: toSortedRows(topLandingPages, 10).map(({ key, count }) => ({
        path: key,
        count,
      })),
      conversionHighlights: {
        pageViews: countFor("page_view"),
        whatsappClicks: countFor("whatsapp_click"),
        signups: countFor("signup_completed"),
        applicationsSubmitted: countFor("application_submitted"),
        contactSubmissions: countFor("contact_form_submit"),
      },
    };
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();
