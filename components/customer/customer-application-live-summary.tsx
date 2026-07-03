"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useCallback, useState } from "react";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { NextActionBadge } from "@/components/customer/NextActionBadge";
import type { CustomerNextAction } from "@/features/customer/lib/next-action";
import { useApplicationRealtime } from "@/features/realtime/hooks/use-application-realtime";
import type { ApplicationStatusSnapshot } from "@/features/realtime/types";

type CustomerApplicationLiveSummaryProps = {
  applicationId: string;
  initialStatus: ApplicationStatus;
  initialStatusLabel: string;
  initialNextAction: CustomerNextAction;
  initialNextActionLabel: string;
  initialUpdatedAt: string;
  labels: {
    status: string;
    nextAction: string;
    updated: string;
  };
  statusLabel: (status: ApplicationStatus) => string;
  nextActionLabel: (action: CustomerNextAction) => string;
  formatUpdatedAt: (iso: string) => string;
};

export function CustomerApplicationLiveSummary({
  applicationId,
  initialStatus,
  initialStatusLabel,
  initialNextAction,
  initialNextActionLabel,
  initialUpdatedAt,
  labels,
  statusLabel,
  nextActionLabel,
  formatUpdatedAt,
}: CustomerApplicationLiveSummaryProps) {
  const [status, setStatus] = useState(initialStatus);
  const [statusText, setStatusText] = useState(initialStatusLabel);
  const [nextAction, setNextAction] = useState(initialNextAction);
  const [nextActionText, setNextActionText] = useState(initialNextActionLabel);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);

  const handleSnapshot = useCallback(
    (snapshot: ApplicationStatusSnapshot) => {
      setStatus(snapshot.status as ApplicationStatus);
      setStatusText(statusLabel(snapshot.status as ApplicationStatus));
      setUpdatedAt(formatUpdatedAt(snapshot.updatedAt));

      if (snapshot.nextAction) {
        const action = snapshot.nextAction as CustomerNextAction;
        setNextAction(action);
        setNextActionText(nextActionLabel(action));
      }
    },
    [formatUpdatedAt, nextActionLabel, statusLabel],
  );

  useApplicationRealtime({
    applicationId,
    onSnapshot: handleSnapshot,
  });

  return (
    <div className="rounded-xl border p-5">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <dt className="text-muted-foreground">{labels.status}</dt>
          <dd>
            <ApplicationStatusBadge status={status} label={statusText} />
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{labels.nextAction}</dt>
          <dd>
            <NextActionBadge action={nextAction} label={nextActionText} />
          </dd>
        </div>
        <div className="flex justify-between gap-3 sm:col-span-2">
          <dt className="text-muted-foreground">{labels.updated}</dt>
          <dd>{updatedAt}</dd>
        </div>
      </dl>
    </div>
  );
}
