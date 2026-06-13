"use client";

import type { AgentApprovalStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";

import { AdminAgentManagePanel } from "@/components/admin/AdminAgentManagePanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminAgentWorkspaceItem } from "@/features/admin/lib/serialize-admin-agent";
import type { AdminCommissionLedgerLabels } from "@/components/admin/AdminCommissionLedger";
import { Link } from "@/i18n/navigation";

type AdminAgentsWorkspaceLabels = {
  columns: {
    agent: string;
    contact: string;
    approval: string;
    account: string;
    commission: string;
    applications: string;
    commissions: string;
    actions: string;
  };
  approvalStatus: Record<AgentApprovalStatus, string>;
  active: string;
  inactive: string;
  manage: string;
  commissionFixedPrefix: string;
  commissionManual: string;
  sheetTitle: string;
  sheetDescription: string;
  viewApplications: string;
  recentApplications: string;
  trackingId: string;
  service: string;
  status: string;
  created: string;
  noRecentApplications: string;
  managePanel: Record<string, string>;
  ledgerLabels: AdminCommissionLedgerLabels;
};

type AdminAgentsWorkspaceProps = {
  agents: AdminAgentWorkspaceItem[];
  locale: "en" | "ur";
  labels: AdminAgentsWorkspaceLabels;
};

function approvalBadgeVariant(
  status: AgentApprovalStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

export function AdminAgentsWorkspace({
  agents,
  locale,
  labels,
}: AdminAgentsWorkspaceProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>{labels.columns.agent}</TableHead>
              <TableHead>{labels.columns.contact}</TableHead>
              <TableHead>{labels.columns.approval}</TableHead>
              <TableHead>{labels.columns.account}</TableHead>
              <TableHead>{labels.columns.commission}</TableHead>
              <TableHead>{labels.columns.applications}</TableHead>
              <TableHead>{labels.columns.commissions}</TableHead>
              <TableHead className="text-end">{labels.columns.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className="font-medium">
                    {agent.user.name ?? agent.user.email}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div>{agent.user.displayEmail}</div>
                  {agent.user.displayPhone ? (
                    <div className="text-xs">{agent.user.displayPhone}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant={approvalBadgeVariant(agent.approvalStatus)}>
                    {labels.approvalStatus[agent.approvalStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={agent.isActive ? "default" : "secondary"}>
                    {agent.isActive ? labels.active : labels.inactive}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {agent.commissionMode === "PERCENTAGE"
                    ? `${agent.commissionRate}%`
                    : agent.commissionMode === "FIXED"
                      ? `${labels.commissionFixedPrefix} ${agent.commissionFixedAmount ?? "0"}`
                      : labels.commissionManual}
                </TableCell>
                <TableCell className="tabular-nums">
                  {agent.applicationCount}
                </TableCell>
                <TableCell className="tabular-nums">
                  {agent.commissionCount}
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <Settings2 className="size-4" />
                    {labels.manage}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={selectedAgentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAgentId(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        >
          {selectedAgent ? (
            <div className="flex h-full flex-col">
              <div className="border-b bg-muted/30 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {labels.sheetTitle}
                </p>
                <SheetTitle className="mt-1 text-xl">
                  {selectedAgent.user.name ?? selectedAgent.user.email}
                </SheetTitle>
                <SheetDescription className="mt-1">
                  {labels.sheetDescription}
                </SheetDescription>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={approvalBadgeVariant(selectedAgent.approvalStatus)}>
                    {labels.approvalStatus[selectedAgent.approvalStatus]}
                  </Badge>
                  <Badge variant={selectedAgent.isActive ? "default" : "secondary"}>
                    {selectedAgent.isActive ? labels.active : labels.inactive}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6 px-6 py-5">
                <AdminAgentManagePanel
                  agentProfileId={selectedAgent.id}
                  approvalStatus={selectedAgent.approvalStatus}
                  isActive={selectedAgent.isActive}
                  commissionMode={selectedAgent.commissionMode}
                  commissionRate={selectedAgent.commissionRate}
                  commissionFixedAmount={selectedAgent.commissionFixedAmount}
                  payoutMethod={selectedAgent.payoutMethod}
                  commissions={selectedAgent.commissions}
                  notes={selectedAgent.notes}
                  locale={locale}
                  labels={labels.managePanel}
                  ledgerLabels={labels.ledgerLabels}
                />

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">
                      {labels.recentApplications}
                    </h3>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/applications?q=${encodeURIComponent(
                          selectedAgent.user.email,
                        )}`}
                      >
                        {labels.viewApplications}
                      </Link>
                    </Button>
                  </div>

                  {selectedAgent.recentApplications.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{labels.trackingId}</TableHead>
                            <TableHead>{labels.service}</TableHead>
                            <TableHead>{labels.status}</TableHead>
                            <TableHead>{labels.created}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAgent.recentApplications.map((application) => (
                            <TableRow key={application.id}>
                              <TableCell className="font-mono text-xs">
                                <Link
                                  href={`/admin/applications/${application.id}`}
                                  className="text-primary hover:underline"
                                >
                                  {application.trackingId}
                                </Link>
                              </TableCell>
                              <TableCell className="text-sm">
                                {locale === "ur"
                                  ? application.serviceNameUr
                                  : application.serviceNameEn}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{application.status}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Intl.DateTimeFormat(
                                  locale === "ur" ? "ur-PK" : "en-PK",
                                  { dateStyle: "medium" },
                                ).format(new Date(application.createdAt))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                      {labels.noRecentApplications}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
