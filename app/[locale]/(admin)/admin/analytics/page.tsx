import type { Metadata } from "next";
import type { Route } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminAnalyticsSummaryPanels } from "@/features/admin/components/admin-analytics-summary-panels";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { Button } from "@/components/ui/button";
import {
  adminAnalyticsRepository,
  type AdminAnalyticsPeriod,
} from "@/server/repositories/admin-analytics-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { requireAdminPortal } from "@/server/permissions/guards";

type AdminAnalyticsPageProps = {
  searchParams: Promise<{ days?: string }>;
};

function parsePeriod(value: string | undefined): AdminAnalyticsPeriod {
  if (value === "7") {
    return 7;
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
  await requireAdminPortal();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("admin.analytics");
  const { days: daysParam } = await searchParams;
  const periodDays = parsePeriod(daysParam);
  const summary = await adminAnalyticsRepository.getSummary(periodDays);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant={periodDays === 7 ? "default" : "outline"}
              size="sm"
            >
              <Link href={"/admin/analytics?days=7" as Route}>{t("last7Days")}</Link>
            </Button>
            <Button
              asChild
              variant={periodDays === 30 ? "default" : "outline"}
              size="sm"
            >
              <Link href={"/admin/analytics?days=30" as Route}>{t("last30Days")}</Link>
            </Button>
          </div>
        }
      />

      <AdminAnalyticsSummaryPanels summary={summary} />
    </div>
  );
}
