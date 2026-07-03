import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CustomerApplicationsLivePanel } from "@/components/customer/customer-applications-live-panel";
import { CustomerDashboardHero } from "@/components/customer/customer-dashboard-hero";
import { CustomerDashboardStats } from "@/components/customer/customer-dashboard-stats";
import { CustomerQuickActions } from "@/components/customer/customer-quick-actions";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { resolveCustomerNextAction } from "@/features/customer/lib/next-action";
import { customerDashboardStatusCards } from "@/config/customer";
import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { formatDateTime } from "@/lib/utils";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { customerApplicationRepository } from "@/server/repositories/customer-application-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customer.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CustomerDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("customer.dashboard");
  const tStatus = await getTranslations("admin.statuses");
  const tNextAction = await getTranslations("customer.nextAction");
  const user = await getCurrentUser();

  const displayEmail =
    user?.email && !isTempPhoneEmail(user.email) ? user.email : "";
  const rawPhone = user?.phone ?? "";
  const contactLine =
    displayEmail || (rawPhone ? formatPhoneForDisplay(rawPhone) : "");
  const displayName = user?.name?.trim() || contactLine || "";

  const [applications, statusCounts] = user
    ? await Promise.all([
        customerApplicationRepository.listForUser(user.id),
        customerApplicationRepository.getStatusCountsForUser(user.id),
      ])
    : [
        [],
        {
          total: 0,
          actionRequired: 0,
          inProgress: 0,
          completed: 0,
          closed: 0,
        },
      ];

  const statusCardValues: Record<string, number> = {
    total: statusCounts.total,
    actionRequired: statusCounts.actionRequired,
    inProgress: statusCounts.inProgress,
    completed: statusCounts.completed,
    closed: statusCounts.closed,
  };

  const applicationRows = applications.map((application) => {
    const serviceName =
      locale === "ur"
        ? application.service.nameUr
        : application.service.nameEn;
    const payment = application.payments[0] ?? null;
    const nextAction = resolveCustomerNextAction({
      status: application.status,
      hasInvoice: application.invoices.length > 0,
      paymentStatus: payment?.status ?? null,
      hasCompletionProof: application.documents.length > 0,
    });

    return {
      id: application.id,
      trackingId: application.trackingId,
      serviceName,
      status: application.status,
      statusLabel: tStatus(getApplicationStatusLabelKey(application.status)),
      nextAction,
      nextActionLabel: tNextAction(nextAction),
      updatedAt: formatDateTime(application.updatedAt, locale),
    };
  });

  const gettingStartedSteps = [
    {
      title: t("steps.chooseService.title"),
      description: t("steps.chooseService.description"),
    },
    {
      title: t("steps.submitApplication.title"),
      description: t("steps.submitApplication.description"),
    },
    {
      title: t("steps.trackProgress.title"),
      description: t("steps.trackProgress.description"),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CustomerDashboardHero
        name={displayName}
        contactLine={contactLine}
        labels={{
          eyebrow: t("eyebrow"),
          title: t("title"),
          welcome: t("welcome", { name: displayName }),
          subtitle: t("subtitle"),
          servicesCta: t("servicesCta"),
          trackCta: t("trackCta"),
          accountLabel: t("accountLabel"),
        }}
      />

      <CustomerDashboardStats
        items={customerDashboardStatusCards.map((card) => ({
          key: card.key,
          label: t(`statusCards.${card.key}`),
          value: statusCardValues[card.key] ?? 0,
        }))}
      />

      <CustomerApplicationsLivePanel
        initialApplications={applicationRows}
        title={t("applicationsTitle")}
        countLabel={t("applicationsCount", { count: applications.length })}
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("applicationsEmpty")}
        emptyCta={t("emptyCta")}
        emptyCtaHref="/services"
        gettingStartedSteps={gettingStartedSteps}
        labels={{
          trackingId: t("columns.trackingId"),
          service: t("columns.service"),
          status: t("columns.status"),
          nextAction: t("columns.nextAction"),
          updated: t("columns.updated"),
          actions: t("columns.actions"),
          viewApplication: t("viewApplication"),
        }}
      />

      <CustomerQuickActions
        actions={[
          {
            key: "services",
            href: "/services",
            title: t("servicesTitle"),
            description: t("servicesDescription"),
            cta: t("servicesCta"),
            icon: "services",
            accent: "border-t-4 border-t-primary/30",
          },
          {
            key: "track",
            href: "/track",
            title: t("trackTitle"),
            description: t("trackDescription"),
            cta: t("trackCta"),
            icon: "track",
            accent: "border-t-4 border-t-blue-500/30",
          },
          {
            key: "support",
            href: "/contact",
            title: t("supportTitle"),
            description: t("supportDescription"),
            cta: t("supportCta"),
            icon: "support",
            accent: "border-t-4 border-t-secondary/50",
          },
        ]}
      />
    </div>
  );
}
