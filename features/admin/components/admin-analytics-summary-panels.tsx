import { getTranslations } from "next-intl/server";
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
import { InsightStatCard } from "@/features/admin/components/insight-stat-card";
import type { AdminAnalyticsSummary } from "@/server/repositories/admin-analytics-repository";

type AdminAnalyticsSummaryPanelsProps = {
  summary: AdminAnalyticsSummary;
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export async function AdminAnalyticsSummaryPanels({
  summary,
}: AdminAnalyticsSummaryPanelsProps) {
  const t = await getTranslations("admin.analytics");

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("highlightsTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <InsightStatCard
            title={t("pageViews")}
            value={summary.conversionHighlights.pageViews.toLocaleString()}
          />
          <InsightStatCard
            title={t("whatsappClicks")}
            value={summary.conversionHighlights.whatsappClicks.toLocaleString()}
            accent="primary"
          />
          <InsightStatCard
            title={t("signups")}
            value={summary.conversionHighlights.signups.toLocaleString()}
          />
          <InsightStatCard
            title={t("applicationsSubmitted")}
            value={summary.conversionHighlights.applicationsSubmitted.toLocaleString()}
            href="/admin/applications"
          />
          <InsightStatCard
            title={t("contactSubmissions")}
            value={summary.conversionHighlights.contactSubmissions.toLocaleString()}
            href="/admin/contact-inquiries"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("trafficByChannel")}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.trafficByChannel.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("channel")}</TableHead>
                    <TableHead className="text-end">{t("count")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.trafficByChannel.map((row) => (
                    <TableRow key={row.channel}>
                      <TableCell className="capitalize">
                        {formatLabel(row.channel)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {row.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("trafficByPlatform")}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.trafficByPlatform.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("platform")}</TableHead>
                    <TableHead className="text-end">{t("count")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.trafficByPlatform.map((row) => (
                    <TableRow key={row.platform}>
                      <TableCell className="capitalize">
                        {formatLabel(row.platform)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {row.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("whatsappByPlacement")}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.whatsappByPlacement.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("placement")}</TableHead>
                    <TableHead className="text-end">{t("count")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.whatsappByPlacement.map((row) => (
                    <TableRow key={row.placement}>
                      <TableCell>{formatLabel(row.placement)}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {row.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("topLandingPages")}</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topLandingPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("path")}</TableHead>
                    <TableHead className="text-end">{t("count")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.topLandingPages.map((row) => (
                    <TableRow key={row.path}>
                      <TableCell className="font-mono text-xs">{row.path}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {row.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allEvents")}</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.eventCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
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
                    <TableCell>{formatLabel(row.event)}</TableCell>
                    <TableCell className="text-end tabular-nums">
                      {row.count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
