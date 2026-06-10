import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Headphones, Search } from "lucide-react";

import { SupportApplicationsTable } from "@/components/support/support-applications-table";
import { supportApplicationsBasePath, supportDashboardStatusCards } from "@/config/support";
import { StatCard } from "@/features/admin/components/stat-card";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { applicationRepository } from "@/server/repositories/application-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("support.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function SupportDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("support.dashboard");
  const tAdmin = await getTranslations("admin");
  const tStatus = await getTranslations("admin.statuses");
  const user = await getCurrentUser();

  const [pipelineCounts, recentApplications] = await Promise.all([
    applicationRepository.getAdminPipelineStatusCounts(),
    applicationRepository.listRecent(8),
  ]);

  const statusCardValues: Record<string, number> = {
    total: Object.values(pipelineCounts).reduce((sum, count) => sum + count, 0),
    review: (pipelineCounts.REVIEW ?? 0) + (pipelineCounts.SUBMITTED ?? 0),
    docsRequired: pipelineCounts.DOCS_REQUIRED ?? 0,
    needsAttention:
      (pipelineCounts.INVOICE_SENT ?? 0) + (pipelineCounts.PAYMENT_UPLOADED ?? 0),
    inProgress:
      (pipelineCounts.PAYMENT_VERIFIED ?? 0) +
      (pipelineCounts.IN_PROGRESS ?? 0) +
      (pipelineCounts.AT_OFFICE ?? 0),
    completed: pipelineCounts.COMPLETED ?? 0,
  };

  const statHrefMap: Record<string, string> = {
    total: supportApplicationsBasePath,
    review: `${supportApplicationsBasePath}?status=REVIEW`,
    docsRequired: `${supportApplicationsBasePath}?status=DOCS_REQUIRED`,
    needsAttention: `${supportApplicationsBasePath}?status=PAYMENT_UPLOADED`,
    inProgress: `${supportApplicationsBasePath}?status=IN_PROGRESS`,
    completed: `${supportApplicationsBasePath}?status=COMPLETED`,
  };

  const recentRows = recentApplications.map((application) => ({
    id: application.id,
    trackingId: application.trackingId,
    status: application.status,
    createdAt: application.createdAt,
    serviceName:
      locale === "ur"
        ? application.service.nameUr
        : application.service.nameEn,
    customerName: application.user.name ?? "—",
    customerEmail: application.user.email,
    statusLabel: tStatus(getApplicationStatusLabelKey(application.status)),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {t("welcome", { name: user?.name ?? user?.email ?? "" })}
            </p>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild>
              <Link href={supportApplicationsBasePath}>
                {t("queueCta")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/track">
                <Search className="size-4" aria-hidden="true" />
                {t("trackCta")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {supportDashboardStatusCards.map((card) => (
          <StatCard
            key={card.key}
            title={t(`statusCards.${card.key}`)}
            value={statusCardValues[card.key] ?? 0}
            href={statHrefMap[card.key]}
          />
        ))}
      </div>

      <section className="rounded-xl border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">{t("recentApplications")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("recentApplicationsDescription")}
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={supportApplicationsBasePath}>{t("viewAll")}</Link>
          </Button>
        </div>
        {recentRows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{t("applicationsEmpty")}</p>
        ) : (
          <div className="overflow-x-auto p-2">
            <SupportApplicationsTable
              applications={recentRows}
              locale={locale}
              detailBasePath={supportApplicationsBasePath}
              labels={{
                trackingId: tAdmin("applications.columns.trackingId"),
                service: tAdmin("applications.columns.service"),
                customer: tAdmin("applications.columns.customer"),
                status: tAdmin("applications.columns.status"),
                created: tAdmin("applications.columns.created"),
                actions: tAdmin("applications.columns.actions"),
                view: tAdmin("applications.view"),
              }}
            />
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-5">
          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="font-semibold">{t("guidanceTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("guidanceDescription")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">{t("permissionsTitle")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{t("permissions.readApplications")}</li>
            <li>{t("permissions.addNotes")}</li>
            <li>{t("permissions.viewDocuments")}</li>
            <li>{t("permissions.noPayments")}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
