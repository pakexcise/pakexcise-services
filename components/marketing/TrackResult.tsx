import type { ApplicationStatus } from "@prisma/client";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { formatDate } from "@/lib/utils";
import type { Route } from "next";
import Link from "next/link";

type TrackResultProps = {
  trackingId: string;
  status: string;
  serviceName: string;
  updatedAt: string;
  locale: string;
  labels: {
    title: string;
    trackingId: string;
    service: string;
    status: string;
    updated: string;
    publicStatusDescription: string;
    accountPrompt: string;
    accountCta: string;
  };
  statusLabel: string;
  publicStatusMessage: string;
  accountHref: string;
};

export function TrackResult({
  trackingId,
  status,
  serviceName,
  updatedAt,
  locale,
  labels,
  statusLabel,
  publicStatusMessage,
  accountHref,
}: TrackResultProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold">{labels.title}</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{labels.trackingId}</dt>
          <dd className="font-medium">{trackingId}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{labels.service}</dt>
          <dd>{serviceName}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="mb-2 text-muted-foreground">{labels.status}</dt>
          <dd>
            <ApplicationStatusBadge
              status={status as ApplicationStatus}
              label={statusLabel}
            />
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{labels.updated}</dt>
          <dd>{formatDate(updatedAt, locale)}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">{publicStatusMessage}</p>
      <p className="text-sm">{labels.accountPrompt}</p>
      <Link
        href={accountHref as Route}
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
      >
        {labels.accountCta}
      </Link>
    </div>
  );
}
