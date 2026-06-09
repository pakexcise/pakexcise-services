import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentApprovalBanner } from "@/components/agent/AgentApprovalBanner";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { StatCard } from "@/features/admin/components/stat-card";
import { agentDashboardStatusCards } from "@/config/agent";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("agent.dashboard");
  const tStatus = await getTranslations("admin.statuses");
  const user = await getCurrentUser();

  const isApproved = user ? isApprovedActiveAgent(user) : false;
  const approvalStatus = user?.agentProfile?.approvalStatus ?? "PENDING";

  const [applications, statusCounts] =
    user && isApproved
      ? await Promise.all([
          agentApplicationRepository.listForAgent(user.id).then((items) => items.slice(0, 5)),
          agentApplicationRepository.getStatusCountsForAgent(user.id),
        ])
      : [[], { total: 0, inProgress: 0, completed: 0, closed: 0 }];

  const statusCardValues: Record<string, number> = {
    total: statusCounts.total,
    inProgress: statusCounts.inProgress,
    completed: statusCounts.completed,
    closed: statusCounts.closed,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("welcome", { name: user?.name ?? user?.email ?? "" })}
        </p>
      </div>

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agentDashboardStatusCards.map((card) => (
              <StatCard
                key={card.key}
                title={t(`statusCards.${card.key}`)}
                value={statusCardValues[card.key] ?? 0}
              />
            ))}
          </div>

          <div className="rounded-xl border">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
              <h2 className="font-semibold">{t("recentApplications")}</h2>
              <Button asChild size="sm" variant="outline">
                <Link href="/agent/applications">{t("viewAll")}</Link>
              </Button>
            </div>
            {applications.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">{t("applicationsEmpty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("columns.trackingId")}</TableHead>
                    <TableHead>{t("columns.service")}</TableHead>
                    <TableHead>{t("columns.status")}</TableHead>
                    <TableHead>{t("columns.updated")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Link
                          href={`/agent/applications/${application.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          {application.trackingId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {locale === "ur"
                          ? application.service.nameUr
                          : application.service.nameEn}
                      </TableCell>
                      <TableCell>
                        <ApplicationStatusBadge
                          status={application.status}
                          label={tStatus(
                            getApplicationStatusLabelKey(application.status),
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(application.updatedAt, locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      )}
    </div>
  );
}
