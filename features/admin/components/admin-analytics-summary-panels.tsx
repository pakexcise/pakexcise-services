import {
  Eye,
  FileText,
  MessageCircle,
  MousePointerClick,
  UserPlus,
} from "lucide-react";
import { getTranslations } from "@/lib/i18n/t";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AnalyticsDonutChart,
  AnalyticsHorizontalBarChart,
  AnalyticsTrendChart,
  AnalyticsVerticalBarChart,
} from "@/features/admin/components/admin-analytics-charts";
import { InsightStatCard } from "@/features/admin/components/insight-stat-card";
import type {
  AdminAnalyticsDailyPoint,
  AdminAnalyticsSummary,
} from "@/server/repositories/admin-analytics-repository";

type AdminAnalyticsSummaryPanelsProps = {
  summary: AdminAnalyticsSummary;
  /** Always-visible last-30-days trend (even when another period is selected). */
  last30DaysSeries: AdminAnalyticsDailyPoint[];
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function truncatePath(path: string, max = 36): string {
  if (path.length <= max) {
    return path;
  }

  return `${path.slice(0, max - 1)}…`;
}

export async function AdminAnalyticsSummaryPanels({
  summary,
  last30DaysSeries,
}: AdminAnalyticsSummaryPanelsProps) {
  const t = await getTranslations("admin.analytics");
  const h = summary.conversionHighlights;
  const rates = summary.conversionRates;

  const trendLabels = {
    pageViews: t("pageViews"),
    whatsappClicks: t("whatsappClicks"),
    signups: t("signups"),
    applicationsSubmitted: t("applicationsSubmitted"),
    contactSubmissions: t("contactSubmissions"),
    serviceViews: t("serviceViews"),
  };

  const channelData = summary.trafficByChannel.map((row) => ({
    name: formatLabel(row.channel),
    value: row.count,
  }));
  const platformData = summary.trafficByPlatform.map((row) => ({
    name: formatLabel(row.platform),
    value: row.count,
  }));
  const placementData = summary.whatsappByPlacement.map((row) => ({
    name: formatLabel(row.placement),
    value: row.count,
  }));
  const landingData = summary.topLandingPages.map((row) => ({
    name: truncatePath(row.path),
    value: row.count,
  }));
  const eventData = summary.eventCounts.slice(0, 10).map((row) => ({
    name: formatLabel(row.event),
    value: row.count,
  }));

  const showPeriodTrend = summary.periodDays !== 30;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("highlightsTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("periodLabel", { days: summary.periodDays })}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <InsightStatCard
            title={t("pageViews")}
            value={h.pageViews.toLocaleString()}
            subtitle={t("publicTrafficOnly")}
            deltaPercent={summary.deltas.pageViews}
            deltaLabel={t("vsPreviousPeriod")}
            className="relative overflow-hidden"
          />
          <InsightStatCard
            title={t("whatsappClicks")}
            value={h.whatsappClicks.toLocaleString()}
            subtitle={t("ctrLabel", { rate: rates.whatsappCtr })}
            deltaPercent={summary.deltas.whatsappClicks}
            deltaLabel={t("vsPreviousPeriod")}
            accent="success"
          />
          <InsightStatCard
            title={t("serviceViews")}
            value={h.serviceViews.toLocaleString()}
            deltaPercent={summary.deltas.serviceViews}
            deltaLabel={t("vsPreviousPeriod")}
            accent="primary"
          />
          <InsightStatCard
            title={t("signups")}
            value={h.signups.toLocaleString()}
            subtitle={t("rateLabel", { rate: rates.signupRate })}
            deltaPercent={summary.deltas.signups}
            deltaLabel={t("vsPreviousPeriod")}
          />
          <InsightStatCard
            title={t("applicationsSubmitted")}
            value={h.applicationsSubmitted.toLocaleString()}
            subtitle={t("rateLabel", { rate: rates.applicationRate })}
            deltaPercent={summary.deltas.applicationsSubmitted}
            deltaLabel={t("vsPreviousPeriod")}
            href="/admin/applications"
            accent="warning"
          />
          <InsightStatCard
            title={t("contactSubmissions")}
            value={h.contactSubmissions.toLocaleString()}
            subtitle={t("rateLabel", { rate: rates.contactRate })}
            deltaPercent={summary.deltas.contactSubmissions}
            deltaLabel={t("vsPreviousPeriod")}
            href="/admin/contact-inquiries"
          />
        </div>
      </section>

      <AnalyticsTrendChart
        title={t("last30DaysChartTitle")}
        description={t("last30DaysChartHint")}
        data={last30DaysSeries}
        emptyLabel={t("empty")}
        labels={trendLabels}
        height={360}
      />

      {showPeriodTrend ? (
        <AnalyticsTrendChart
          title={t("activityOverTime")}
          description={t("activityOverTimeHint")}
          data={summary.dailySeries}
          emptyLabel={t("empty")}
          labels={trendLabels}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsDonutChart
          title={t("trafficByChannel")}
          description={t("trafficChannelHint")}
          data={channelData}
          emptyLabel={t("empty")}
        />
        <AnalyticsVerticalBarChart
          title={t("trafficByPlatform")}
          description={t("trafficPlatformHint")}
          data={platformData}
          emptyLabel={t("empty")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsHorizontalBarChart
          title={t("topLandingPages")}
          description={t("landingPagesHint")}
          data={landingData}
          emptyLabel={t("empty")}
        />
        <AnalyticsVerticalBarChart
          title={t("whatsappByPlacement")}
          description={t("whatsappPlacementHint")}
          data={placementData}
          emptyLabel={t("empty")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AnalyticsHorizontalBarChart
          title={t("topEvents")}
          description={t("topEventsHint")}
          data={eventData}
          emptyLabel={t("empty")}
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("allEvents")}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.eventCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <div className="max-h-[300px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("event")}</TableHead>
                      <TableHead className="text-end">{t("count")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.eventCounts.map((row) => (
                      <TableRow key={row.event}>
                        <TableCell className="capitalize">
                          {formatLabel(row.event)}
                        </TableCell>
                        <TableCell className="text-end tabular-nums">
                          {row.count.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p>
          {t("ga4Hint")}{" "}
          <Link
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("openGa4")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden="true" />
            {t("legendPublicViews")}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden="true" />
            {t("legendWhatsapp")}
          </span>
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="size-3.5" aria-hidden="true" />
            {t("legendServices")}
          </span>
          <span className="inline-flex items-center gap-1">
            <UserPlus className="size-3.5" aria-hidden="true" />
            {t("legendSignups")}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3.5" aria-hidden="true" />
            {t("legendApplications")}
          </span>
        </div>
      </div>
    </div>
  );
}
