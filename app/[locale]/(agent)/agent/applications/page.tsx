import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import { AgentNextActionBadge } from "@/components/agent/AgentNextActionBadge";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { resolveAgentNextAction } from "@/features/agents/lib/agent-next-action";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
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
import { formatDateTime } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.applications");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentApplicationsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user || !isApprovedActiveAgent(user)) {
    redirect({ href: "/agent/dashboard", locale });
    return;
  }

  const t = await getTranslations("agent.applications");
  const tStatus = await getTranslations("admin.statuses");
  const tNextAction = await getTranslations("agent.nextAction");

  const applications = await agentApplicationRepository.listForAgent(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/agent/applications/new">{t("newApplication")}</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {applications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            <Button asChild className="mt-4">
              <Link href="/agent/applications/new">{t("newApplication")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>{t("columns.trackingId")}</TableHead>
                    <TableHead>{t("columns.customer")}</TableHead>
                    <TableHead>{t("columns.service")}</TableHead>
                    <TableHead>{t("columns.status")}</TableHead>
                    <TableHead>{t("columns.nextAction")}</TableHead>
                    <TableHead>{t("columns.updated")}</TableHead>
                    <TableHead className="text-end">{t("columns.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => {
                    const nextAction = resolveAgentNextAction({
                      status: application.status,
                      hasCommission: false,
                    });

                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {application.trackingId}
                        </TableCell>
                        <TableCell>
                          {application.user.name ?? application.user.email}
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
                          <AgentNextActionBadge
                            action={nextAction}
                            label={tNextAction(nextAction)}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(application.updatedAt, locale)}
                        </TableCell>
                        <TableCell className="text-end">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/agent/applications/${application.id}`}>
                              {t("view")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {applications.map((application) => {
                const nextAction = resolveAgentNextAction({
                  status: application.status,
                  hasCommission: false,
                });

                return (
                  <article
                    key={application.id}
                    className="rounded-xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold">
                          {application.trackingId}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {locale === "ur"
                            ? application.service.nameUr
                            : application.service.nameEn}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {application.user.name ?? application.user.email}
                        </p>
                      </div>
                      <ApplicationStatusBadge
                        status={application.status}
                        label={tStatus(
                          getApplicationStatusLabelKey(application.status),
                        )}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t("columns.nextAction")}:
                      </span>
                      <AgentNextActionBadge
                        action={nextAction}
                        label={tNextAction(nextAction)}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(application.updatedAt, locale)}
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                      <Link href={`/agent/applications/${application.id}`}>
                        {t("view")}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
