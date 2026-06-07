import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dashboardStatusCards } from "@/config/admin";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { QuickLinks, quickLinkIcons } from "@/features/admin/components/quick-links";
import { RecentApplicationsTable } from "@/features/admin/components/recent-applications-table";
import { StatCard } from "@/features/admin/components/stat-card";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { applicationRepository } from "@/server/repositories/application-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.dashboard"));
}

export default async function AdminDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  let stats = {
    total: 0,
    review: 0,
    docsRequired: 0,
    invoiceSent: 0,
    paymentUploaded: 0,
    paymentVerified: 0,
    inProgress: 0,
    completed: 0,
    rejectedCancelled: 0,
  };
  let recentApplications: Awaited<
    ReturnType<typeof applicationRepository.listRecent>
  > = [];

  try {
    [stats, recentApplications] = await Promise.all([
      applicationRepository.getDashboardStats(),
      applicationRepository.listRecent(10),
    ]);
  } catch {
    stats = {
      total: 0,
      review: 0,
      docsRequired: 0,
      invoiceSent: 0,
      paymentUploaded: 0,
      paymentVerified: 0,
      inProgress: 0,
      completed: 0,
      rejectedCancelled: 0,
    };
    recentApplications = [];
  }

  const statHrefMap: Record<string, string | undefined> = {
    total: "/admin/applications",
    review: "/admin/applications?status=REVIEW",
    docsRequired: "/admin/applications?status=DOCS_REQUIRED",
    invoiceSent: "/admin/applications?status=INVOICE_SENT",
    paymentUploaded: "/admin/applications?status=PAYMENT_UPLOADED",
    paymentVerified: "/admin/applications?status=PAYMENT_VERIFIED",
    inProgress: "/admin/applications?status=IN_PROGRESS",
    completed: "/admin/applications?status=COMPLETED",
    rejectedCancelled: "/admin/applications?status=REJECTED",
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStatusCards.map((card) => (
          <StatCard
            key={card.key}
            title={t(`dashboard.cards.${card.key}`)}
            value={stats[card.key as keyof typeof stats]}
            href={statHrefMap[card.key]}
          />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RecentApplicationsTable
          applications={recentApplications}
          title={t("dashboard.recentApplications")}
          emptyMessage={t("dashboard.recentEmpty")}
          viewLabel={t("dashboard.viewAllApplications")}
        />
        <QuickLinks
          title={t("dashboard.quickLinks")}
          links={[
            {
              href: "/admin/services",
              label: t("dashboard.links.services"),
              icon: quickLinkIcons.services,
            },
            {
              href: "/admin/applications?status=REVIEW",
              label: t("dashboard.links.applicationQueue"),
              icon: quickLinkIcons.applications,
            },
            {
              href: "/admin/applications?status=PAYMENT_UPLOADED",
              label: t("dashboard.links.paymentVerification"),
              icon: quickLinkIcons.payments,
            },
            {
              href: "/admin/audit-logs",
              label: t("dashboard.links.auditLogs"),
              icon: quickLinkIcons.audit,
            },
          ]}
        />
      </div>
    </div>
  );
}
