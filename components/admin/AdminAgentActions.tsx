"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveAgentAction,
  createAgentCommissionAction,
  rejectAgentAction,
  toggleAgentActiveAction,
  updateAgentCommissionRateAction,
} from "@/features/admin/agents/actions";

type AdminAgentActionsProps = {
  agentProfileId: string;
  approvalStatus: string;
  isActive: boolean;
  commissionRate: string;
  notes?: string | null;
  labels: {
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    rejectNotes: string;
    commissionRate: string;
    updateRate: string;
    updatingRate: string;
    toggleActive: string;
    toggleInactive: string;
    toggling: string;
    addCommission: string;
    commissionLabel: string;
    commissionAmount: string;
    commissionDescription: string;
    addingCommission: string;
    success: string;
    error: string;
    approvalSection: string;
    accountSection: string;
    commissionSection: string;
    payoutSection: string;
    showPayoutForm: string;
    hidePayoutForm: string;
  };
};

export function AdminAgentActions({
  agentProfileId,
  approvalStatus,
  isActive,
  commissionRate,
  notes,
  labels,
}: AdminAgentActionsProps) {
  const router = useRouter();
  const fieldId = (name: string) => `${agentProfileId}-${name}`;
  const [rejectNotes, setRejectNotes] = useState(notes ?? "");
  const [rate, setRate] = useState(commissionRate);
  const [commissionLabel, setCommissionLabel] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [commissionDescription, setCommissionDescription] = useState("");
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveAgentAction({ agentProfileId });
      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }
      setMessage(labels.success);
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectAgentAction({ agentProfileId, notes: rejectNotes });
      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }
      setMessage(labels.success);
      router.refresh();
    });
  }

  function handleUpdateRate() {
    setError(null);
    startTransition(async () => {
      const result = await updateAgentCommissionRateAction({
        agentProfileId,
        commissionRate: Number(rate),
      });
      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }
      setMessage(labels.success);
      router.refresh();
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
        setError(result.error ?? labels.error);
        return;
      }
      setMessage(labels.success);
      router.refresh();
    });
  }

  function handleAddCommission() {
    setError(null);
    startTransition(async () => {
      const result = await createAgentCommissionAction({
        agentProfileId,
        label: commissionLabel,
        amount: Number(commissionAmount),
        description: commissionDescription || undefined,
      });
      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }
      setCommissionLabel("");
      setCommissionAmount("");
      setCommissionDescription("");
      setShowPayoutForm(false);
      setMessage(labels.success);
      router.refresh();
    });
  }

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
              placeholder={labels.rejectNotes}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{labels.accountSection}</h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleActive}
            disabled={isPending}
          >
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
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
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
          <Button type="button" onClick={handleUpdateRate} disabled={isPending}>
            {isPending ? labels.updatingRate : labels.updateRate}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{labels.payoutSection}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPayoutForm((current) => !current)}
          >
            {showPayoutForm ? (
              <>
                <ChevronUp className="size-4" />
                {labels.hidePayoutForm}
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                {labels.showPayoutForm}
              </>
            )}
          </Button>
        </div>

        {showPayoutForm ? (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={fieldId("commissionLabel")}>
                  {labels.commissionLabel}
                </Label>
                <Input
                  id={fieldId("commissionLabel")}
                  value={commissionLabel}
                  onChange={(event) => setCommissionLabel(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={fieldId("commissionAmount")}>
                  {labels.commissionAmount}
                </Label>
                <Input
                  id={fieldId("commissionAmount")}
                  type="number"
                  step="0.01"
                  min="0"
                  value={commissionAmount}
                  onChange={(event) => setCommissionAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={fieldId("commissionDescription")}>
                  {labels.commissionDescription}
                </Label>
                <Textarea
                  id={fieldId("commissionDescription")}
                  value={commissionDescription}
                  onChange={(event) =>
                    setCommissionDescription(event.target.value)
                  }
                  rows={2}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCommission}
              disabled={
                isPending ||
                !commissionLabel.trim() ||
                !commissionAmount ||
                Number(commissionAmount) <= 0
              }
            >
              {isPending ? labels.addingCommission : labels.addCommission}
            </Button>
          </div>
        ) : null}
      </section>

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
