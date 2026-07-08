import { getTranslations } from "next-intl/server";

import { InsightStatCard } from "@/features/admin/components/insight-stat-card";
import type { AdminDashboardInsights } from "@/server/repositories/admin-dashboard-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type DashboardInsightCardsProps = {
  insights: AdminDashboardInsights;
};

export async function DashboardInsightCards({
  insights,
}: DashboardInsightCardsProps) {
  const locale = await getCurrentLocale();
  const t = await getTranslations("admin.dashboard.insights");

  const topServiceName = insights.mostRequestedService
    ? locale === "ur"
      ? insights.mostRequestedService.nameUr
      : insights.mostRequestedService.nameEn
    : "—";

  const topProvinceName = insights.topProvince
    ? locale === "ur"
      ? insights.topProvince.nameUr
      : insights.topProvince.nameEn
    : "—";

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("title")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <InsightStatCard
          title={t("todayApplications")}
          value={insights.todayApplications.toLocaleString()}
          href="/admin/applications"
          accent="primary"
        />
        <InsightStatCard
          title={t("todayContactInquiries")}
          value={insights.todayContactInquiries.toLocaleString()}
          href="/admin/contact-inquiries"
        />
        <InsightStatCard
          title={t("todayNewUsers")}
          value={insights.todayNewUsers.toLocaleString()}
          href="/admin/customers"
        />
        <InsightStatCard
          title={t("todayWhatsappClicks")}
          value={insights.todayWhatsappClicks.toLocaleString()}
          href="/admin/analytics"
        />
        <InsightStatCard
          title={t("todaySignups")}
          value={insights.todaySignups.toLocaleString()}
          href="/admin/customers"
        />
        <InsightStatCard
          title={t("pendingSupportRequests")}
          value={insights.pendingSupportRequests.toLocaleString()}
          href="/admin/guest-leads?status=NEW"
          accent="warning"
        />
        <InsightStatCard
          title={t("paymentUploadedQueue")}
          value={insights.paymentUploadedQueue.toLocaleString()}
          href="/admin/applications?status=PAYMENT_UPLOADED"
        />
        <InsightStatCard
          title={t("mostRequestedService")}
          value={topServiceName}
          subtitle={
            insights.mostRequestedService
              ? t("applicationCount", {
                  count: insights.mostRequestedService.count,
                })
              : undefined
          }
          href="/admin/services"
        />
        <InsightStatCard
          title={t("topProvince")}
          value={topProvinceName}
          subtitle={
            insights.topProvince
              ? t("applicationCount", { count: insights.topProvince.count })
              : undefined
          }
          href="/admin/regions"
        />
      </div>
    </section>
  );
}
