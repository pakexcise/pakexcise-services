import "server-only";

import type { ActivityEventName } from "@/features/tracking/events";
import { isPublicAnalyticsPath } from "@/features/tracking/lib/public-analytics-path";
import { Repository } from "@/server/repositories/base/repository";

export type AdminAnalyticsPeriod = 7 | 30 | 90;

export type AdminAnalyticsDailyPoint = {
  date: string;
  pageViews: number;
  whatsappClicks: number;
  signups: number;
  applicationsSubmitted: number;
  contactSubmissions: number;
  serviceViews: number;
};

export type AdminAnalyticsSummary = {
  periodDays: AdminAnalyticsPeriod;
  eventCounts: Array<{ event: string; count: number }>;
  whatsappByPlacement: Array<{ placement: string; count: number }>;
  trafficByChannel: Array<{ channel: string; count: number }>;
  trafficByPlatform: Array<{ platform: string; count: number }>;
  topLandingPages: Array<{ path: string; count: number }>;
  dailySeries: AdminAnalyticsDailyPoint[];
  conversionHighlights: {
    pageViews: number;
    whatsappClicks: number;
    signups: number;
    applicationsSubmitted: number;
    contactSubmissions: number;
    serviceViews: number;
  };
  conversionRates: {
    whatsappCtr: number;
    signupRate: number;
    applicationRate: number;
    contactRate: number;
  };
  deltas: {
    pageViews: number | null;
    whatsappClicks: number | null;
    signups: number | null;
    applicationsSubmitted: number | null;
    contactSubmissions: number | null;
    serviceViews: number | null;
  };
};

type MetadataRecord = Record<string, unknown>;

function startOfPeriod(days: AdminAnalyticsPeriod, offsetPeriods = 0): Date {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1) - offsetPeriods * days);
  since.setUTCHours(0, 0, 0, 0);
  return since;
}

function endOfPreviousPeriod(days: AdminAnalyticsPeriod): Date {
  const end = startOfPeriod(days);
  end.setUTCMilliseconds(-1);
  return end;
}

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildEmptySeries(days: AdminAnalyticsPeriod): Map<string, AdminAnalyticsDailyPoint> {
  const map = new Map<string, AdminAnalyticsDailyPoint>();
  const cursor = startOfPeriod(days);

  for (let i = 0; i < days; i += 1) {
    const key = toUtcDateKey(cursor);
    map.set(key, {
      date: key,
      pageViews: 0,
      whatsappClicks: 0,
      signups: 0,
      applicationsSubmitted: 0,
      contactSubmissions: 0,
      serviceViews: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return map;
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

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? 100 : null;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const TREND_EVENTS = [
  "page_view",
  "whatsapp_click",
  "signup_completed",
  "application_submitted",
  "contact_form_submit",
  "service_view",
] as const;

export class AdminAnalyticsRepository extends Repository {
  async getSummary(periodDays: AdminAnalyticsPeriod): Promise<AdminAnalyticsSummary> {
    const since = startOfPeriod(periodDays);
    const previousSince = startOfPeriod(periodDays, 1);
    const previousUntil = endOfPreviousPeriod(periodDays);

    const [groupedEvents, previousGroupedEvents, detailEvents, timedEvents, previousPageViewRows] =
      await Promise.all([
        this.db.activityEvent.groupBy({
          by: ["event"],
          where: {
            environment: "production",
            createdAt: { gte: since },
          },
          _count: { _all: true },
        }),
        this.db.activityEvent.groupBy({
          by: ["event"],
          where: {
            environment: "production",
            createdAt: { gte: previousSince, lte: previousUntil },
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
          take: 12000,
        }),
        this.db.activityEvent.findMany({
          where: {
            environment: "production",
            createdAt: { gte: since },
            event: {
              in: [...TREND_EVENTS],
            },
          },
          select: {
            event: true,
            path: true,
            createdAt: true,
          },
        }),
        this.db.activityEvent.findMany({
          where: {
            environment: "production",
            createdAt: { gte: previousSince, lte: previousUntil },
            event: "page_view",
          },
          select: { path: true },
          take: 20000,
        }),
      ]);

    const whatsappByPlacement = new Map<string, number>();
    const trafficByChannel = new Map<string, number>();
    const trafficByPlatform = new Map<string, number>();
    const topLandingPages = new Map<string, number>();
    const daily = buildEmptySeries(periodDays);

    for (const row of detailEvents) {
      if (row.event === "whatsapp_click") {
        const placement =
          readMetadataString(row.metadata, "placement") ?? "unknown";
        incrementCount(whatsappByPlacement, placement);
        continue;
      }

      if (row.event === "page_view") {
        if (!isPublicAnalyticsPath(row.path)) {
          continue;
        }

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

    let publicPageViews = 0;

    for (const row of timedEvents) {
      const day = daily.get(toUtcDateKey(row.createdAt));
      if (!day) {
        continue;
      }

      switch (row.event) {
        case "page_view":
          if (isPublicAnalyticsPath(row.path)) {
            day.pageViews += 1;
            publicPageViews += 1;
          }
          break;
        case "whatsapp_click":
          day.whatsappClicks += 1;
          break;
        case "signup_completed":
          day.signups += 1;
          break;
        case "application_submitted":
          day.applicationsSubmitted += 1;
          break;
        case "contact_form_submit":
          day.contactSubmissions += 1;
          break;
        case "service_view":
          day.serviceViews += 1;
          break;
        default:
          break;
      }
    }

    const eventCountMap = new Map<string, number>(
      groupedEvents.map((row) => [row.event, row._count._all]),
    );

    const countFor = (event: ActivityEventName): number =>
      eventCountMap.get(event) ?? 0;

    const whatsappClicks = countFor("whatsapp_click");
    const signups = countFor("signup_completed");
    const applicationsSubmitted = countFor("application_submitted");
    const contactSubmissions = countFor("contact_form_submit");
    const serviceViews = countFor("service_view");

    const previousCountMap = new Map<string, number>(
      previousGroupedEvents.map((row) => [row.event, row._count._all]),
    );
    const previousCountFor = (event: ActivityEventName): number =>
      previousCountMap.get(event) ?? 0;

    // Prefer public-path filtered previous page views for a fair delta.
    const previousPageViews = previousPageViewRows.filter((row) =>
      isPublicAnalyticsPath(row.path),
    ).length;

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
      topLandingPages: toSortedRows(topLandingPages, 12).map(({ key, count }) => ({
        path: key,
        count,
      })),
      dailySeries: [...daily.values()],
      conversionHighlights: {
        pageViews: publicPageViews,
        whatsappClicks,
        signups,
        applicationsSubmitted,
        contactSubmissions,
        serviceViews,
      },
      conversionRates: {
        whatsappCtr: percent(whatsappClicks, publicPageViews),
        signupRate: percent(signups, publicPageViews),
        applicationRate: percent(applicationsSubmitted, publicPageViews),
        contactRate: percent(contactSubmissions, publicPageViews),
      },
      deltas: {
        pageViews: percentChange(publicPageViews, previousPageViews),
        whatsappClicks: percentChange(
          whatsappClicks,
          previousCountFor("whatsapp_click"),
        ),
        signups: percentChange(signups, previousCountFor("signup_completed")),
        applicationsSubmitted: percentChange(
          applicationsSubmitted,
          previousCountFor("application_submitted"),
        ),
        contactSubmissions: percentChange(
          contactSubmissions,
          previousCountFor("contact_form_submit"),
        ),
        serviceViews: percentChange(
          serviceViews,
          previousCountFor("service_view"),
        ),
      },
    };
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();
