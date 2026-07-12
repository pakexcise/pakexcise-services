import type { Metadata } from "next";
import type { Route } from "next";
import { getTranslations } from "@/lib/i18n/t";
import Link from "next/link";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminAnalyticsSummaryPanels } from "@/features/admin/components/admin-analytics-summary-panels";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { Button } from "@/components/ui/button";
import {
  adminAnalyticsRepository,
  type AdminAnalyticsPeriod,
} from "@/server/repositories/admin-analytics-repository";
import { requireSuperAdmin } from "@/server/permissions/guards";

type AdminAnalyticsPageProps = {
  searchParams: Promise<{ days?: string }>;
};

function parsePeriod(value: string | undefined): AdminAnalyticsPeriod {
  if (value === "7") {
    return 7;
  }

  if (value === "90") {
    return 90;
  }

  return 30;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.analytics"));
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  await requireSuperAdmin();

  const locale = "en";
    const t = await getTranslations("admin.analytics");
  const { days: daysParam } = await searchParams;
  const periodDays = parsePeriod(daysParam);

  const [summary, summary30] = await Promise.all([
    adminAnalyticsRepository.getSummary(periodDays),
    periodDays === 30
      ? Promise.resolve(null)
      : adminAnalyticsRepository.getSummary(30),
  ]);

  const last30DaysSeries =
    periodDays === 30 ? summary.dailySeries : (summary30?.dailySeries ?? []);

  const periods: Array<{ days: AdminAnalyticsPeriod; label: string }> = [
    { days: 7, label: t("last7Days") },
    { days: 30, label: t("last30Days") },
    { days: 90, label: t("last90Days") },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="inline-flex rounded-lg border bg-background p-1 shadow-sm">
            {periods.map((period) => (
              <Button
                key={period.days}
                asChild
                variant={periodDays === period.days ? "default" : "ghost"}
                size="sm"
                className="rounded-md"
              >
                <Link href={`/admin/analytics?days=${period.days}` as Route}>
                  {period.label}
                </Link>
              </Button>
            ))}
          </div>
        }
      />

      <AdminAnalyticsSummaryPanels
        summary={summary}
        last30DaysSeries={last30DaysSeries}
      />
    </div>
  );
}
