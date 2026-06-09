import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminAgentActions } from "@/components/admin/AdminAgentActions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";
import { agentRepository } from "@/server/repositories/agent-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type AdminAgentsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.agents"));
}

export default async function AdminAgentsPage({
  searchParams,
}: AdminAgentsPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status?.trim();
  const status =
    statusParam === "PENDING" ||
    statusParam === "APPROVED" ||
    statusParam === "REJECTED"
      ? statusParam
      : undefined;

  const result = await agentRepository.listForAdmin({
    page,
    pageSize: adminDefaultPageSize,
    search,
    status,
  });

  const agentsWithDetails = await Promise.all(
    result.items.map(async (agent) => ({
      agent,
      applicationCount: await agentRepository.countApplicationsByAgent(agent.user.id),
      recentApplications: await agentApplicationRepository.listByAgentForAdmin(
        agent.user.id,
        5,
      ),
    })),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("agents.title")}
        description={t("agents.description")}
      />

      {result.items.length === 0 ? (
        <EmptyState
          title={t("agents.emptyTitle")}
          description={t("agents.emptyDescription")}
        />
      ) : (
        <div className="space-y-6">
          {agentsWithDetails.map(({ agent, applicationCount, recentApplications }) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>
                        {agent.user.name ?? agent.user.email}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {agent.user.email}
                        {agent.user.phone ? ` · ${agent.user.phone}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{agent.approvalStatus}</Badge>
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? t("agents.active") : t("agents.inactive")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">{t("agents.commissionRate")}</dt>
                      <dd className="font-medium">{agent.commissionRate.toString()}%</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t("agents.applicationCount")}</dt>
                      <dd className="font-medium">{applicationCount}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t("agents.commissionItems")}</dt>
                      <dd className="font-medium">{agent._count.commissions}</dd>
                    </div>
                  </dl>

                  {agent.notes ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {agent.notes}
                    </p>
                  ) : null}

                  <AdminAgentActions
                    agentProfileId={agent.id}
                    approvalStatus={agent.approvalStatus}
                    isActive={agent.isActive}
                    commissionRate={agent.commissionRate.toString()}
                    labels={{
                      approve: t("agents.actions.approve"),
                      approving: t("agents.actions.approving"),
                      reject: t("agents.actions.reject"),
                      rejecting: t("agents.actions.rejecting"),
                      rejectNotes: t("agents.actions.rejectNotes"),
                      commissionRate: t("agents.commissionRate"),
                      updateRate: t("agents.actions.updateRate"),
                      updatingRate: t("agents.actions.updatingRate"),
                      toggleActive: t("agents.actions.activate"),
                      toggleInactive: t("agents.actions.deactivate"),
                      toggling: t("agents.actions.toggling"),
                      addCommission: t("agents.actions.addCommission"),
                      commissionLabel: t("agents.actions.commissionLabel"),
                      commissionAmount: t("agents.actions.commissionAmount"),
                      commissionDescription: t("agents.actions.commissionDescription"),
                      addingCommission: t("agents.actions.addingCommission"),
                      success: t("agents.actions.success"),
                      error: t("agents.actions.error"),
                    }}
                  />

                  {recentApplications.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">
                        {t("agents.recentApplications")}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("agents.columns.trackingId")}</TableHead>
                            <TableHead>{t("agents.columns.service")}</TableHead>
                            <TableHead>{t("agents.columns.status")}</TableHead>
                            <TableHead>{t("agents.columns.created")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentApplications.map((application) => (
                            <TableRow key={application.id}>
                              <TableCell className="font-mono text-xs">
                                {application.trackingId}
                              </TableCell>
                              <TableCell>
                                {locale === "ur"
                                  ? application.service.nameUr
                                  : application.service.nameEn}
                              </TableCell>
                              <TableCell>{application.status}</TableCell>
                              <TableCell>
                                {formatDate(application.createdAt, locale)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
          ))}

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/agents"
          />
        </div>
      )}
    </div>
  );
}
