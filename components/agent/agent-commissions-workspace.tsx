"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  XCircle,
} from "lucide-react";

import {
  AgentPayoutMethodManager,
  type AgentPayoutMethodManagerLabels,
  type AgentPayoutMethodValues,
} from "@/components/agent/agent-payout-method-manager";
import { SecureCommissionProofViewer } from "@/components/shared/SecureCommissionProofViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateAgentCommissionReceiptAction } from "@/features/agents/actions/commission";
import { cn } from "@/lib/utils";

export type AgentCommissionRow = {
  id: string;
  label: string;
  description: string | null;
  amount: string;
  source: string;
  payoutStatus: string;
  trackingId: string | null;
  hasProof: boolean;
  agentReceiptStatus: string;
  agentConfirmedAt: string | null;
  agentDisputeReason: string | null;
  adminResolutionNote: string | null;
  paidAt: string | null;
  createdAt: string;
};

type AgentCommissionsWorkspaceLabels = {
  empty: string;
  filterAll: string;
  filterPending: string;
  filterPaid: string;
  filterCancelled: string;
  summaryPending: string;
  summaryPaid: string;
  summaryAwaiting: string;
  noTrackingId: string;
  viewProof: string;
  hideProof: string;
  confirmReceipt: string;
  notReceived: string;
  changeReceipt: string;
  disputeReason: string;
  disputePlaceholder: string;
  adminResponse: string;
  submitDispute: string;
  cancelDispute: string;
  confirming: string;
  disputing: string;
  confirmError: string;
  receiptReceived: string;
  receiptNotReceived: string;
  receiptAwaiting: string;
  paidOn: string;
  footer: string;
  proofLoading: string;
  proofError: string;
  proofRetry: string;
  proofOpen: string;
  proofUnsupported: string;
  source_MANUAL: string;
  source_AUTO_PERCENTAGE: string;
  source_AUTO_FIXED: string;
  status_PENDING: string;
  status_PROCESSING: string;
  status_PAID: string;
  status_CANCELLED: string;
};

type AgentCommissionsWorkspaceProps = {
  commissions: AgentCommissionRow[];
  commissionSummary: string;
  locale: "en" | "ur";
  labels: AgentCommissionsWorkspaceLabels;
  payoutMethod: AgentPayoutMethodValues;
  hasPayoutMethod: boolean;
  payoutMethodLabels: AgentPayoutMethodManagerLabels;
};

type StatusFilter = "all" | "PENDING" | "PAID" | "CANCELLED";

const STATUS_FILTERS: StatusFilter[] = ["all", "PENDING", "PAID", "CANCELLED"];

function formatAmount(locale: "en" | "ur", amount: string) {
  return new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(Number(amount));
}

function filterCount(commissions: AgentCommissionRow[], filter: StatusFilter) {
  if (filter === "all") return commissions.length;
  if (filter === "PENDING") {
    return commissions.filter(
      (item) => item.payoutStatus === "PENDING" || item.payoutStatus === "PROCESSING",
    ).length;
  }
  return commissions.filter((item) => item.payoutStatus === filter).length;
}

function payoutBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "PROCESSING":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function receiptBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "RECEIVED":
      return "default";
    case "NOT_RECEIVED":
      return "destructive";
    default:
      return "secondary";
  }
}

export function AgentCommissionsWorkspace({
  commissions,
  commissionSummary,
  locale,
  labels,
  payoutMethod,
  hasPayoutMethod,
  payoutMethodLabels,
}: AgentCommissionsWorkspaceProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCommissions = useMemo(() => {
    if (statusFilter === "all") return commissions;
    if (statusFilter === "PENDING") {
      return commissions.filter(
        (item) =>
          item.payoutStatus === "PENDING" || item.payoutStatus === "PROCESSING",
      );
    }
    return commissions.filter((item) => item.payoutStatus === statusFilter);
  }, [commissions, statusFilter]);

  const summary = useMemo(() => {
    const pending = commissions.filter(
      (item) =>
        item.payoutStatus === "PENDING" || item.payoutStatus === "PROCESSING",
    );
    const paid = commissions.filter((item) => item.payoutStatus === "PAID");
    const awaiting = paid.filter((item) => item.agentReceiptStatus === "AWAITING");

    return {
      pendingTotal: pending.reduce((sum, item) => sum + Number(item.amount), 0),
      paidTotal: paid.reduce((sum, item) => sum + Number(item.amount), 0),
      awaitingCount: awaiting.length,
    };
  }, [commissions]);

  function handleReceiptUpdate(
    commissionId: string,
    status: "RECEIVED" | "NOT_RECEIVED",
    reason?: string,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updateAgentCommissionReceiptAction({
        commissionId,
        status,
        reason,
      });

      if (!result.success) {
        setError(result.error ?? labels.confirmError);
        return;
      }

      setDisputeId(null);
      setDisputeReason("");
      router.refresh();
    });
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
  });

  return (
    <div className="space-y-6">
      <p className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">{commissionSummary}</p>

      <AgentPayoutMethodManager
        initialValues={payoutMethod}
        hasMethod={hasPayoutMethod}
        labels={payoutMethodLabels}
        compact
      />

      <section className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {labels.summaryPending}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {formatAmount(locale, summary.pendingTotal.toString())}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {labels.summaryPaid}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {formatAmount(locale, summary.paidTotal.toString())}
            </p>
          </div>
          <div className="rounded-lg border bg-amber-500/10 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
              {labels.summaryAwaiting}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-amber-900 dark:text-amber-100">
              {summary.awaitingCount}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg border bg-muted/20 p-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-colors",
                statusFilter === filter
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="block truncate">
                {filter === "all"
                  ? labels.filterAll
                  : filter === "PENDING"
                    ? labels.filterPending
                    : filter === "PAID"
                      ? labels.filterPaid
                      : labels.filterCancelled}
              </span>
              <span className="mt-0.5 block text-[10px] tabular-nums opacity-80">
                {filterCount(commissions, filter)}
              </span>
            </button>
          ))}
        </div>

        {filteredCommissions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredCommissions.map((commission) => {
              const canRespond =
                commission.payoutStatus === "PAID" && commission.hasProof;
              const isDisputing = disputeId === commission.id;
              const showProof = expandedProofId === commission.id;

              return (
                <article
                  key={commission.id}
                  className={cn(
                    "rounded-xl border bg-background p-3.5",
                    commission.payoutStatus === "CANCELLED" && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {commission.label}
                        </h3>
                        <Badge variant="outline" className="text-[10px]">
                          {commission.source === "MANUAL"
                            ? labels.source_MANUAL
                            : commission.source === "AUTO_PERCENTAGE"
                              ? labels.source_AUTO_PERCENTAGE
                              : labels.source_AUTO_FIXED}
                        </Badge>
                      </div>
                      {commission.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {commission.description}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                      {formatAmount(locale, commission.amount)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={payoutBadgeVariant(commission.payoutStatus)}
                      className="text-[11px]"
                    >
                      {commission.payoutStatus === "PENDING"
                        ? labels.status_PENDING
                        : commission.payoutStatus === "PROCESSING"
                          ? labels.status_PROCESSING
                          : commission.payoutStatus === "PAID"
                            ? labels.status_PAID
                            : labels.status_CANCELLED}
                    </Badge>
                    {commission.payoutStatus === "PAID" ? (
                      <Badge
                        variant={receiptBadgeVariant(commission.agentReceiptStatus)}
                        className="text-[11px]"
                      >
                        {commission.agentReceiptStatus === "RECEIVED"
                          ? labels.receiptReceived
                          : commission.agentReceiptStatus === "NOT_RECEIVED"
                            ? labels.receiptNotReceived
                            : labels.receiptAwaiting}
                      </Badge>
                    ) : null}
                    {commission.trackingId ? (
                      <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        <FileText className="size-3 shrink-0" />
                        <span className="truncate">{commission.trackingId}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        {labels.noTrackingId}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>{dateFormatter.format(new Date(commission.createdAt))}</span>
                    {commission.paidAt ? (
                      <span>
                        {labels.paidOn}{" "}
                        {dateFormatter.format(new Date(commission.paidAt))}
                      </span>
                    ) : null}
                  </div>

                  {commission.agentReceiptStatus === "NOT_RECEIVED" &&
                  commission.agentDisputeReason ? (
                    <p className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-xs text-destructive">
                      {commission.agentDisputeReason}
                    </p>
                  ) : null}

                  {commission.agentReceiptStatus === "AWAITING" &&
                  commission.adminResolutionNote ? (
                    <p className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2 text-xs text-primary">
                      <span className="font-medium">{labels.adminResponse}: </span>
                      {commission.adminResolutionNote}
                    </p>
                  ) : null}

                  {canRespond ? (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {commission.hasProof ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() =>
                            setExpandedProofId((current) =>
                              current === commission.id ? null : commission.id,
                            )
                          }
                        >
                          {showProof ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                          {showProof ? labels.hideProof : labels.viewProof}
                        </Button>
                      ) : null}

                      {!isDisputing ? (
                        <div className="flex flex-wrap gap-1.5">
                          {commission.agentReceiptStatus !== "RECEIVED" ? (
                            <Button
                              type="button"
                              size="sm"
                              className="h-8"
                              disabled={isPending}
                              onClick={() =>
                                handleReceiptUpdate(commission.id, "RECEIVED")
                              }
                            >
                              <CheckCircle2 className="size-3.5" />
                              {isPending ? labels.confirming : labels.confirmReceipt}
                            </Button>
                          ) : null}
                          {commission.agentReceiptStatus !== "NOT_RECEIVED" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8"
                              disabled={isPending}
                              onClick={() => {
                                setDisputeId(commission.id);
                                setDisputeReason(
                                  commission.agentDisputeReason ?? "",
                                );
                              }}
                            >
                              <XCircle className="size-3.5" />
                              {labels.notReceived}
                            </Button>
                          ) : null}
                          {commission.agentReceiptStatus !== "AWAITING" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              disabled={isPending}
                              onClick={() => {
                                if (commission.agentReceiptStatus === "RECEIVED") {
                                  setDisputeId(commission.id);
                                  setDisputeReason("");
                                } else {
                                  handleReceiptUpdate(commission.id, "RECEIVED");
                                }
                              }}
                            >
                              <AlertCircle className="size-3.5" />
                              {labels.changeReceipt}
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                          <label className="text-xs font-medium" htmlFor={`dispute-${commission.id}`}>
                            {labels.disputeReason}
                          </label>
                          <Textarea
                            id={`dispute-${commission.id}`}
                            value={disputeReason}
                            onChange={(event) => setDisputeReason(event.target.value)}
                            placeholder={labels.disputePlaceholder}
                            rows={3}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={isPending || disputeReason.trim().length < 3}
                              onClick={() =>
                                handleReceiptUpdate(
                                  commission.id,
                                  "NOT_RECEIVED",
                                  disputeReason,
                                )
                              }
                            >
                              {isPending ? labels.disputing : labels.submitDispute}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDisputeId(null);
                                setDisputeReason("");
                              }}
                            >
                              {labels.cancelDispute}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {showProof && commission.hasProof ? (
                    <div className="mt-3 border-t pt-3">
                      <SecureCommissionProofViewer
                        commissionId={commission.id}
                        labels={{
                          loading: labels.proofLoading,
                          error: labels.proofError,
                          retry: labels.proofRetry,
                          openNewTab: labels.proofOpen,
                          unsupported: labels.proofUnsupported,
                        }}
                      />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">{labels.footer}</p>
    </div>
  );
}
