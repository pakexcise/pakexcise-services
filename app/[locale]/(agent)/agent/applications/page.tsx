import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
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
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";

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

  const applications = await agentApplicationRepository.listForAgent(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/agent/applications/new">{t("newApplication")}</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        {applications.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.trackingId")}</TableHead>
                <TableHead>{t("columns.customer")}</TableHead>
                <TableHead>{t("columns.service")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.updated")}</TableHead>
                <TableHead className="text-end">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
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
                    {formatDate(application.updatedAt, locale)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/agent/applications/${application.id}`}>
                        {t("view")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
