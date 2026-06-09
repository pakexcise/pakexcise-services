import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { StatusTimeline } from "@/components/customer/StatusTimeline";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";

type AgentApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.application");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentApplicationDetailPage({
  params,
}: AgentApplicationDetailPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user || !isApprovedActiveAgent(user)) {
    redirect("/agent/dashboard");
  }

  const t = await getTranslations("agent.application");
  const tStatus = await getTranslations("admin.statuses");

  const application = await agentApplicationRepository.findAssignedById({
    id,
    agentId: user.id,
  });

  if (!application) {
    notFound();
  }

  const serviceName =
    locale === "ur"
      ? application.service.nameUr
      : application.service.nameEn;

  const statusLabel = (status: Parameters<typeof getApplicationStatusLabelKey>[0]) =>
    tStatus(getApplicationStatusLabelKey(status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {application.trackingId}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agent/applications">{t("backToList")}</Link>
        </Button>
      </div>

      <div className="rounded-xl border p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <dt className="text-muted-foreground">{t("status")}</dt>
            <dd>
              <ApplicationStatusBadge
                status={application.status}
                label={statusLabel(application.status)}
              />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("service")}</dt>
            <dd>{serviceName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("customer")}</dt>
            <dd>{application.user.name ?? application.user.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("submitted")}</dt>
            <dd>{formatDate(application.createdAt, locale)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("updated")}</dt>
            <dd>{formatDate(application.updatedAt, locale)}</dd>
          </div>
        </dl>
      </div>

      <StatusTimeline
        entries={application.statusHistory}
        currentStatus={application.status}
        locale={locale}
        labels={{
          title: t("timeline.title"),
          empty: t("timeline.empty"),
          current: t("timeline.current"),
        }}
        statusLabel={statusLabel}
      />

      <p className="text-sm text-muted-foreground">{t("trackingNote")}</p>
    </div>
  );
}
