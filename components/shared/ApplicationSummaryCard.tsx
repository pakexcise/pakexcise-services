import type { ReactNode } from "react";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import type { ApplicationStatus } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";

type ApplicationSummaryCardProps = {
  status: ApplicationStatus;
  statusLabel: string;
  serviceName: string;
  submittedAt: Date | string;
  updatedAt: Date | string;
  locale: string;
  labels: {
    status: string;
    service: string;
    submitted: string;
    updated: string;
    nextAction?: string;
    customer?: string;
    region?: string;
  };
  nextAction?: ReactNode;
  customerName?: string | null;
  regionName?: string | null;
};

export function ApplicationSummaryCard({
  status,
  statusLabel,
  serviceName,
  submittedAt,
  updatedAt,
  locale,
  labels,
  nextAction,
  customerName,
  regionName,
}: ApplicationSummaryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <dt className="text-muted-foreground">{labels.status}</dt>
          <dd>
            <ApplicationStatusBadge status={status} label={statusLabel} />
          </dd>
        </div>

        {nextAction !== undefined ? (
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <dt className="text-muted-foreground">{labels.nextAction}</dt>
            <dd>{nextAction}</dd>
          </div>
        ) : null}

        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">{labels.service}</dt>
          <dd className="text-end font-medium">{serviceName}</dd>
        </div>

        {regionName ? (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">{labels.region}</dt>
            <dd className="text-end font-medium">{regionName}</dd>
          </div>
        ) : null}

        {customerName ? (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">{labels.customer}</dt>
            <dd className="text-end font-medium">{customerName}</dd>
          </div>
        ) : null}

        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">{labels.submitted}</dt>
          <dd className="text-end">{formatDateTime(submittedAt, locale)}</dd>
        </div>

        <div className="flex justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">{labels.updated}</dt>
          <dd className="text-end">{formatDateTime(updatedAt, locale)}</dd>
        </div>
      </dl>
    </div>
  );
}
