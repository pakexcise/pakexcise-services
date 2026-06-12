import type { ApplicationStatus } from "@prisma/client";

import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { formatDateTime } from "@/lib/utils";

type StatusHistoryEntry = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  createdAt: Date | string;
};

type StatusTimelineProps = {
  entries: StatusHistoryEntry[];
  currentStatus: ApplicationStatus;
  locale: string;
  labels: {
    title: string;
    empty: string;
    current: string;
  };
  statusLabel: (status: ApplicationStatus) => string;
};

export function StatusTimeline({
  entries,
  currentStatus,
  locale,
  labels,
  statusLabel,
}: StatusTimelineProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sortedEntries.length === 0) {
    return (
      <div className="rounded-xl border p-5">
        <h2 className="font-semibold">{labels.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{labels.empty}</p>
        <div className="mt-4">
          <ApplicationStatusBadge
            status={currentStatus}
            label={statusLabel(currentStatus)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold">{labels.title}</h2>
      <ol className="relative mt-4 space-y-0 border-s border-border ps-6">
        {sortedEntries.map((entry, index) => {
          const isLast = index === sortedEntries.length - 1;

          return (
            <li key={entry.id} className="relative pb-6 last:pb-0">
              <span
                className="absolute -start-[7px] top-1 size-3 rounded-full border-2 border-background bg-primary"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ApplicationStatusBadge
                  status={entry.toStatus}
                  label={statusLabel(entry.toStatus)}
                />
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={new Date(entry.createdAt).toISOString()}
                >
                  {formatDateTime(entry.createdAt, locale)}
                </time>
              </div>
              {isLast ? (
                <p className="mt-1 text-xs text-muted-foreground">{labels.current}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function getStatusLabelFromTranslations(
  tStatus: (key: string) => string,
  status: ApplicationStatus,
): string {
  return tStatus(getApplicationStatusLabelKey(status));
}
