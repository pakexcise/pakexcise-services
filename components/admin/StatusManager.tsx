"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { ApplicationStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { transitionApplicationStatusAction } from "@/features/applications/actions";

type StatusManagerProps = {
  applicationId: string;
  currentStatus: ApplicationStatus;
  allowedStatuses: ApplicationStatus[];
  statusLabels: Record<string, string>;
  labels: {
    title: string;
    description: string;
    currentStatus: string;
    nextStatus: string;
    note: string;
    notePlaceholder: string;
    submit: string;
    submitting: string;
    noTransitions: string;
    success: string;
    error: string;
    requiresProof: string;
  };
  requiresProof?: boolean;
  hasProof?: boolean;
};

export function StatusManager({
  applicationId,
  currentStatus,
  allowedStatuses,
  statusLabels,
  labels,
  requiresProof = false,
  hasProof = false,
}: StatusManagerProps) {
  const router = useRouter();
  const [toStatus, setToStatus] = useState<ApplicationStatus | "">("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const options = useMemo(
    () =>
      allowedStatuses.map((status) => ({
        value: status,
        label: statusLabels[status] ?? status,
      })),
    [allowedStatuses, statusLabels],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!toStatus) {
      setError(labels.error);
      return;
    }

    if (toStatus === "COMPLETED" && requiresProof && !hasProof) {
      setError(labels.requiresProof);
      return;
    }

    startTransition(async () => {
      const result = await transitionApplicationStatusAction({
        applicationId,
        toStatus,
        note,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.success);
      setNote("");
      setToStatus("");
      router.refresh();
    });
  }

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        {labels.noTransitions}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold">{labels.title}</h3>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{labels.currentStatus}</Label>
          <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
            {statusLabels[currentStatus] ?? currentStatus}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toStatus">{labels.nextStatus}</Label>
          <select
            id="toStatus"
            value={toStatus}
            onChange={(event) =>
              setToStatus(event.target.value as ApplicationStatus)
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isPending}
          >
            <option value="">{labels.nextStatus}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="statusNote">{labels.note}</Label>
        <Textarea
          id="statusNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={labels.notePlaceholder}
          rows={4}
          disabled={isPending}
          required
          minLength={3}
        />
      </div>

      {toStatus === "COMPLETED" && requiresProof && !hasProof ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {labels.requiresProof}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="text-sm text-primary" role="status">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !toStatus}>
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
