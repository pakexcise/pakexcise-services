"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
  };
};

export function AdminAgentActions({
  agentProfileId,
  approvalStatus,
  isActive,
  commissionRate,
  labels,
}: AdminAgentActionsProps) {
  const router = useRouter();
  const [rejectNotes, setRejectNotes] = useState("");
  const [rate, setRate] = useState(commissionRate);
  const [commissionLabel, setCommissionLabel] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [commissionDescription, setCommissionDescription] = useState("");
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
      setMessage(labels.success);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
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
        <Button type="button" variant="outline" onClick={handleToggleActive} disabled={isPending}>
          {isPending
            ? labels.toggling
            : isActive
              ? labels.toggleInactive
              : labels.toggleActive}
        </Button>
      </div>

      {approvalStatus !== "APPROVED" ? (
        <div className="space-y-2">
          <Label htmlFor="rejectNotes">{labels.rejectNotes}</Label>
          <Textarea
            id="rejectNotes"
            value={rejectNotes}
            onChange={(event) => setRejectNotes(event.target.value)}
            rows={3}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="commissionRate">{labels.commissionRate}</Label>
          <Input
            id="commissionRate"
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

      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{labels.addCommission}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="commissionLabel">{labels.commissionLabel}</Label>
            <Input
              id="commissionLabel"
              value={commissionLabel}
              onChange={(event) => setCommissionLabel(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionAmount">{labels.commissionAmount}</Label>
            <Input
              id="commissionAmount"
              type="number"
              step="0.01"
              min="0"
              value={commissionAmount}
              onChange={(event) => setCommissionAmount(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="commissionDescription">{labels.commissionDescription}</Label>
            <Textarea
              id="commissionDescription"
              value={commissionDescription}
              onChange={(event) => setCommissionDescription(event.target.value)}
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </div>
  );
}
