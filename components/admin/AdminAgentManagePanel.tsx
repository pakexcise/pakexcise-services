"use client";

import type { AgentCommissionMode } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  AdminCommissionLedger,
  type AdminCommissionLedgerLabels,
} from "@/components/admin/AdminCommissionLedger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAgentWorkspaceCommission } from "@/features/admin/lib/serialize-admin-agent";
import {
  approveAgentAction,
  rejectAgentAction,
  toggleAgentActiveAction,
  updateAgentCommissionConfigAction,
} from "@/features/admin/agents/actions";

type PayoutMethod = {
  type: string | null;
  accountTitle: string | null;
  accountNumber: string | null;
  iban: string | null;
  bankName: string | null;
  walletNumber: string | null;
  notes: string | null;
};

type AdminAgentManagePanelProps = {
  agentProfileId: string;
  approvalStatus: string;
  isActive: boolean;
  commissionMode: AgentCommissionMode;
  commissionRate: string;
  commissionFixedAmount: string | null;
  payoutMethod: PayoutMethod;
  commissions: AdminAgentWorkspaceCommission[];
  notes?: string | null;
  locale: "en" | "ur";
  labels: Record<string, string>;
  ledgerLabels: AdminCommissionLedgerLabels;
};

const MODES: AgentCommissionMode[] = ["MANUAL", "PERCENTAGE", "FIXED"];

export function AdminAgentManagePanel({
  agentProfileId,
  approvalStatus,
  isActive,
  commissionMode,
  commissionRate,
  commissionFixedAmount,
  payoutMethod,
  commissions,
  notes,
  locale,
  labels,
  ledgerLabels,
}: AdminAgentManagePanelProps) {
  const router = useRouter();
  const fieldId = (name: string) => `${agentProfileId}-${name}`;

  const [rejectNotes, setRejectNotes] = useState(notes ?? "");
  const [mode, setMode] = useState<AgentCommissionMode>(commissionMode);
  const [rate, setRate] = useState(commissionRate);
  const [fixedAmount, setFixedAmount] = useState(commissionFixedAmount ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshSuccess() {
    setMessage(labels.success ?? null);
    router.refresh();
  }

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveAgentAction({ agentProfileId });
      if (!result.success) {
        setError(result.error ?? labels.error ?? null);
        return;
      }
      refreshSuccess();
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectAgentAction({ agentProfileId, notes: rejectNotes });
      if (!result.success) {
        setError(result.error ?? labels.error ?? null);
        return;
      }
      refreshSuccess();
    });
  }

  function handleUpdateCommissionConfig() {
    setError(null);
    startTransition(async () => {
      const result = await updateAgentCommissionConfigAction({
        agentProfileId,
        commissionMode: mode,
        commissionRate: mode === "PERCENTAGE" ? Number(rate) : undefined,
        commissionFixedAmount:
          mode === "FIXED" && fixedAmount ? Number(fixedAmount) : undefined,
      });
      if (!result.success) {
        setError(result.error ?? labels.error ?? null);
        return;
      }
      refreshSuccess();
    });
  }

  function handleToggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await toggleAgentActiveAction({
        agentProfileId,
        isActive: !isActive,
      });
      if (!result.success) {
        setError(result.error ?? labels.error ?? null);
        return;
      }
      refreshSuccess();
    });
  }

  const payoutMethodConfigured = Boolean(
    payoutMethod.type && payoutMethod.accountTitle,
  );

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">{labels.approvalSection}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {approvalStatus !== "APPROVED" ? (
            <Button type="button" onClick={handleApprove} disabled={isPending}>
              {isPending ? labels.approving : labels.approve}
            </Button>
          ) : null}
          {approvalStatus !== "REJECTED" ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || rejectNotes.trim().length < 3}
            >
              {isPending ? labels.rejecting : labels.reject}
            </Button>
          ) : null}
        </div>
        {approvalStatus !== "APPROVED" ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor={fieldId("rejectNotes")}>{labels.rejectNotes}</Label>
            <Textarea
              id={fieldId("rejectNotes")}
              value={rejectNotes}
              onChange={(event) => setRejectNotes(event.target.value)}
              rows={3}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{labels.accountSection}</h3>
          <Button type="button" variant="outline" onClick={handleToggleActive} disabled={isPending}>
            {isPending
              ? labels.toggling
              : isActive
                ? labels.toggleInactive
                : labels.toggleActive}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">{labels.commissionSection}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{labels.commissionHelp}</p>
        <div className="mt-3 grid gap-3">
          <div className="space-y-2">
            <Label htmlFor={fieldId("commissionMode")}>{labels.commissionMode}</Label>
            <select
              id={fieldId("commissionMode")}
              value={mode}
              onChange={(event) => setMode(event.target.value as AgentCommissionMode)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {MODES.map((item) => (
                <option key={item} value={item}>
                  {labels[`commissionMode_${item}`]}
                </option>
              ))}
            </select>
          </div>
          {mode === "PERCENTAGE" ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor={fieldId("commissionRate")}>{labels.commissionRate}</Label>
                <Input
                  id={fieldId("commissionRate")}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                />
              </div>
              <Button type="button" onClick={handleUpdateCommissionConfig} disabled={isPending}>
                {isPending ? labels.updatingRate : labels.updateRate}
              </Button>
            </div>
          ) : null}
          {mode === "FIXED" ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor={fieldId("fixedAmount")}>{labels.fixedAmount}</Label>
                <Input
                  id={fieldId("fixedAmount")}
                  type="number"
                  step="0.01"
                  min="0"
                  value={fixedAmount}
                  onChange={(event) => setFixedAmount(event.target.value)}
                />
              </div>
              <Button type="button" onClick={handleUpdateCommissionConfig} disabled={isPending}>
                {isPending ? labels.updatingRate : labels.updateRate}
              </Button>
            </div>
          ) : null}
          {mode === "MANUAL" ? (
            <Button type="button" variant="outline" onClick={handleUpdateCommissionConfig} disabled={isPending}>
              {isPending ? labels.updatingRate : labels.saveManualMode}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">{labels.payoutMethodSection}</h3>
        {payoutMethodConfigured ? (
          <dl className="mt-3 grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">{labels.payoutMethodType}</dt>
              <dd className="font-medium">{payoutMethod.type}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{labels.payoutAccountTitle}</dt>
              <dd>{payoutMethod.accountTitle}</dd>
            </div>
            {payoutMethod.accountNumber ? (
              <div>
                <dt className="text-muted-foreground">{labels.payoutAccountNumber}</dt>
                <dd className="font-mono text-xs">{payoutMethod.accountNumber}</dd>
              </div>
            ) : null}
            {payoutMethod.iban ? (
              <div>
                <dt className="text-muted-foreground">{labels.payoutIban}</dt>
                <dd className="font-mono text-xs">{payoutMethod.iban}</dd>
              </div>
            ) : null}
            {payoutMethod.bankName ? (
              <div>
                <dt className="text-muted-foreground">{labels.payoutBankName}</dt>
                <dd>{payoutMethod.bankName}</dd>
              </div>
            ) : null}
            {payoutMethod.walletNumber ? (
              <div>
                <dt className="text-muted-foreground">{labels.payoutWalletNumber}</dt>
                <dd className="font-mono text-xs">{payoutMethod.walletNumber}</dd>
              </div>
            ) : null}
            {payoutMethod.notes ? (
              <div>
                <dt className="text-muted-foreground">{labels.payoutNotes}</dt>
                <dd>{payoutMethod.notes}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{labels.payoutMethodMissing}</p>
        )}
      </section>

      <AdminCommissionLedger
        agentProfileId={agentProfileId}
        commissionMode={commissionMode}
        payoutMethodConfigured={payoutMethodConfigured}
        commissions={commissions}
        locale={locale}
        labels={ledgerLabels}
        fieldIdPrefix={agentProfileId}
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      ) : null}
    </div>
  );
}
