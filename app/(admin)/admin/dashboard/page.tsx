import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { dashboardStatusCards } from "@/config/admin";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DashboardInsightCards } from "@/features/admin/components/dashboard-insight-cards";
import { DashboardQuickLinks } from "@/features/admin/components/dashboard-quick-links";
import { RecentApplicationsTable } from "@/features/admin/components/recent-applications-table";
import { RecentContactInquiriesTable } from "@/features/admin/components/recent-contact-inquiries-table";
import { StatCard } from "@/features/admin/components/stat-card";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDashboardRepository } from "@/server/repositories/admin-dashboard-repository";
import { applicationRepository } from "@/server/repositories/application-repository";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";
import { getCachedEffectivePermissions } from "@/server/permissions/effective-permissions";
import { requireAdminPortal } from "@/server/permissions/guards";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.dashboard"));
}

export default async function AdminDashboardPage() {
  const user = await requireAdminPortal();
  const isSuperAdmin = isSuperAdminRole(user.role);
  const effectivePermissions = await getCachedEffectivePermissions(
    user.id,
    user.role,
  );
  const canViewOperations = effectivePermissions.includes("application:read");

  const locale = "en";
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
  let recentContactInquiries: Awaited<
    ReturnType<typeof contactInquiryRepository.listRecent>
  > = [];
  let insights: Awaited<
    ReturnType<typeof adminDashboardRepository.getInsights>
  > | null = null;

  try {
    const fetches: Promise<unknown>[] = [
      applicationRepository.getDashboardStats(),
      applicationRepository.listRecent(8),
    ];

    if (canViewOperations) {
      fetches.push(
        contactInquiryRepository.listRecent(8),
        adminDashboardRepository.getInsights(),
      );
    }

    const results = await Promise.all(fetches);
    stats = results[0] as typeof stats;
    recentApplications = results[1] as typeof recentApplications;

    if (canViewOperations) {
      recentContactInquiries = results[2] as typeof recentContactInquiries;
      insights = results[3] as NonNullable<typeof insights>;
    }
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
    recentContactInquiries = [];
    insights = null;
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
        description={
          isSuperAdmin
            ? t("dashboard.descriptionSuperAdmin")
            : t("dashboard.descriptionAdmin")
        }
        actions={
          <Badge
            variant={isSuperAdmin ? "default" : "secondary"}
            className="shrink-0"
          >
            {isSuperAdmin ? t("roles.superAdmin") : t("roles.admin")}
          </Badge>
        }
      />

      {insights ? <DashboardInsightCards insights={insights} /> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("dashboard.pipelineTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardStatusCards.map((card) => (
            <StatCard
              key={card.key}
              title={t(`dashboard.cards.${card.key}`)}
              value={stats[card.key as keyof typeof stats]}
              href={statHrefMap[card.key]}
            />
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <RecentApplicationsTable
            applications={recentApplications}
            title={t("dashboard.recentApplications")}
            emptyMessage={t("dashboard.recentEmpty")}
            viewLabel={t("dashboard.viewAllApplications")}
          />
          {canViewOperations ? (
            <RecentContactInquiriesTable
              inquiries={recentContactInquiries}
              title={t("dashboard.recentContactInquiries")}
              emptyMessage={t("dashboard.recentContactEmpty")}
              viewLabel={t("dashboard.viewAllContactInquiries")}
            />
          ) : null}
        </div>
        <DashboardQuickLinks
          effectivePermissions={effectivePermissions}
          labels={{
            operationsTitle: t("dashboard.quickLinks"),
            platformTitle: t("dashboard.platformLinks"),
            staffTitle: t("dashboard.staffLinks"),
            services: t("dashboard.links.services"),
            applicationQueue: t("dashboard.links.applicationQueue"),
            paymentVerification: t("dashboard.links.paymentVerification"),
            notifications: t("dashboard.links.notifications"),
            auditLogs: t("dashboard.links.auditLogs"),
            seo: t("dashboard.links.seo"),
            redirects: t("dashboard.links.redirects"),
            blog: t("dashboard.links.blog"),
            settings: t("dashboard.links.settings"),
            users: t("dashboard.links.users"),
          }}
        />
      </div>
    </div>
  );
}
