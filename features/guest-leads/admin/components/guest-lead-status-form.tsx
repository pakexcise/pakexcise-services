"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateGuestLeadStatusAction } from "@/features/guest-leads/actions/admin-guest-lead-actions";
import type { GuestLeadStatus } from "@prisma/client";

type GuestLeadStatusFormProps = {
  leadId: string;
  currentStatus: GuestLeadStatus;
  adminNotes: string | null;
  statusOptions: Array<{ value: GuestLeadStatus; label: string }>;
  labels: {
    status: string;
    notes: string;
    notesPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
  };
};

export function GuestLeadStatusForm({
  leadId,
  currentStatus,
  adminNotes,
  statusOptions,
  labels,
}: GuestLeadStatusFormProps) {
  const [status, setStatus] = useState<GuestLeadStatus>(currentStatus);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateGuestLeadStatusAction({
        leadId,
        status,
        adminNotes: notes,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(labels.success);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Label htmlFor="guest-lead-status">{labels.status}</Label>
        <select
          id="guest-lead-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as GuestLeadStatus)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest-lead-notes">{labels.notes}</Label>
        <Textarea
          id="guest-lead-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={labels.notesPlaceholder}
          rows={4}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
