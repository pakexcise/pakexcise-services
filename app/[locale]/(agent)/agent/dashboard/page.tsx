import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentApprovalBanner } from "@/components/agent/AgentApprovalBanner";
import { AgentApplicationsPanel } from "@/components/agent/agent-applications-panel";
import { AgentCommissionSummary } from "@/components/agent/agent-commission-summary";
import { AgentDashboardHero } from "@/components/agent/agent-dashboard-hero";
import { AgentDashboardStats } from "@/components/agent/agent-dashboard-stats";
import { AgentQuickActions } from "@/components/agent/agent-quick-actions";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { formatPkr } from "@/features/invoices/lib/format-pkr";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { agentDashboardStatusCards } from "@/config/agent";
import { formatDate } from "@/lib/utils";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";
import { agentRepository } from "@/server/repositories/agent-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

function sumCommissionAmounts(
  amounts: Array<{ amount: unknown; payoutStatus: string }>,
  statuses: string[],
): number {
  return amounts
    .filter((item) => statuses.includes(item.payoutStatus))
    .reduce((sum, item) => {
      const numeric =
        typeof item.amount === "string"
          ? Number.parseFloat(item.amount)
          : Number(item.amount);

      return sum + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);
}

export default async function AgentDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("agent.dashboard");
  const tStatus = await getTranslations("admin.statuses");
  const user = await getCurrentUser();

  const displayEmail =
    user?.email && !isTempPhoneEmail(user.email) ? user.email : "";
  const rawPhone = user?.phone ?? "";
  const contactLine =
    displayEmail || (rawPhone ? formatPhoneForDisplay(rawPhone) : "");
  const displayName = user?.name?.trim() || contactLine || "";

  const isApproved = user ? isApprovedActiveAgent(user) : false;
  const approvalStatus = user?.agentProfile?.approvalStatus ?? "APPROVED";
  const agentProfile = user?.agentProfile;

  const [applications, statusCounts, commissions] =
    user && isApproved && agentProfile
      ? await Promise.all([
          agentApplicationRepository
            .listForAgent(user.id)
            .then((items) => items.slice(0, 5)),
          agentApplicationRepository.getStatusCountsForAgent(user.id),
          agentRepository.listCommissionsForAgent(agentProfile.id),
        ])
      : [
          [],
          { total: 0, inProgress: 0, completed: 0, closed: 0 },
          [],
        ];

  const statusCardValues: Record<string, number> = {
    total: statusCounts.total,
    inProgress: statusCounts.inProgress,
    completed: statusCounts.completed,
    closed: statusCounts.closed,
  };

  const applicationRows = applications.map((application) => ({
    id: application.id,
    trackingId: application.trackingId,
    customerName: application.user.name ?? application.user.email,
    serviceName:
      locale === "ur"
        ? application.service.nameUr
        : application.service.nameEn,
    status: application.status,
    statusLabel: tStatus(getApplicationStatusLabelKey(application.status)),
    updatedAt: formatDate(application.updatedAt, locale),
  }));

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
      title: t("steps.trackCommissions.title"),
      description: t("steps.trackCommissions.description"),
    },
  ];

  const pendingTotal = sumCommissionAmounts(commissions, ["PENDING", "PROCESSING"]);
  const paidTotal = sumCommissionAmounts(commissions, ["PAID"]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AgentDashboardHero
        name={displayName}
        contactLine={contactLine}
        commissionRate={
          isApproved && agentProfile
            ? agentProfile.commissionRate.toString()
            : undefined
        }
        labels={{
          eyebrow: t("eyebrow"),
          title: t("title"),
          welcome: t("welcome", { name: displayName }),
          subtitle: t("subtitle"),
          accountLabel: t("accountLabel"),
          commissionRateLabel: t("commissionRateLabel"),
          newApplicationCta: t("newApplicationCta"),
          applicationsCta: t("applicationsCta"),
        }}
      />

      <AgentApprovalBanner
        status={approvalStatus}
        labels={{
          pendingTitle: t("pendingTitle"),
          pendingDescription: t("pendingDescription"),
          rejectedTitle: t("rejectedTitle"),
          rejectedDescription: t("rejectedDescription"),
        }}
      />

      {isApproved ? (
        <>
          <AgentDashboardStats
            items={agentDashboardStatusCards.map((card) => ({
              key: card.key,
              label: t(`statusCards.${card.key}`),
              value: statusCardValues[card.key] ?? 0,
            }))}
          />

          <AgentApplicationsPanel
            applications={applicationRows}
            title={t("applicationsTitle")}
            countLabel={t("applicationsCount", { count: statusCounts.total })}
            viewAllLabel={t("viewAll")}
            viewAllHref="/agent/applications"
            emptyTitle={t("emptyTitle")}
            emptyDescription={t("applicationsEmpty")}
            emptyCta={t("emptyCta")}
            emptyCtaHref="/agent/applications/new"
            gettingStartedSteps={gettingStartedSteps}
            labels={{
              trackingId: t("columns.trackingId"),
              customer: t("columns.customer"),
              service: t("columns.service"),
              status: t("columns.status"),
              updated: t("columns.updated"),
              actions: t("columns.actions"),
              viewApplication: t("viewApplication"),
            }}
          />

          <AgentCommissionSummary
            pendingTotal={formatPkr(pendingTotal, locale)}
            paidTotal={formatPkr(paidTotal, locale)}
            labels={{
              title: t("commissionSummary.title"),
              description: t("commissionSummary.description"),
              pendingLabel: t("commissionSummary.pending"),
              paidLabel: t("commissionSummary.paid"),
              viewAll: t("commissionSummary.viewAll"),
            }}
          />

          <AgentQuickActions
            actions={[
              {
                key: "commissions",
                href: "/agent/commissions",
                title: t("commissionsTitle"),
                description: t("commissionsDescription"),
                cta: t("commissionsCta"),
                icon: "commissions",
                accent: "border-t-4 border-t-secondary/50",
              },
              {
                key: "profile",
                href: "/agent/profile",
                title: t("profileTitle"),
                description: t("profileDescription"),
                cta: t("profileCta"),
                icon: "profile",
                accent: "border-t-4 border-t-primary/30",
              },
              {
                key: "support",
                href: "/contact",
                title: t("supportTitle"),
                description: t("supportDescription"),
                cta: t("supportCta"),
                icon: "support",
                accent: "border-t-4 border-t-blue-500/30",
              },
            ]}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      )}
    </div>
  );
}
