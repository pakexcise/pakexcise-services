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

type TimelineStep = {
  key: string;
  status: ApplicationStatus;
  createdAt: Date | string | null;
  isCurrent: boolean;
};

function buildTimelineSteps(
  entries: StatusHistoryEntry[],
  currentStatus: ApplicationStatus,
): TimelineStep[] {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const steps: TimelineStep[] = sortedEntries.map((entry) => ({
    key: entry.id,
    status: entry.toStatus,
    createdAt: entry.createdAt,
    isCurrent: false,
  }));

  const lastStep = steps.at(-1);

  if (!lastStep) {
    return [
      {
        key: `current-${currentStatus}`,
        status: currentStatus,
        createdAt: null,
        isCurrent: true,
      },
    ];
  }

  if (lastStep.status === currentStatus) {
    lastStep.isCurrent = true;
    return steps;
  }

  return [
    ...steps,
    {
      key: `current-${currentStatus}`,
      status: currentStatus,
      createdAt: null,
      isCurrent: true,
    },
  ];
}

export function StatusTimeline({
  entries,
  currentStatus,
  locale,
  labels,
  statusLabel,
}: StatusTimelineProps) {
  const steps = buildTimelineSteps(entries, currentStatus);

  if (steps.length === 0) {
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
        {steps.map((step) => (
          <li key={step.key} className="relative pb-6 last:pb-0">
            <span
              className={`absolute -start-[7px] top-1 size-3 rounded-full border-2 border-background ${
                step.isCurrent ? "bg-primary" : "bg-muted-foreground/50"
              }`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ApplicationStatusBadge
                status={step.status}
                label={statusLabel(step.status)}
              />
              {step.createdAt ? (
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={new Date(step.createdAt).toISOString()}
                >
                  {formatDateTime(step.createdAt, locale)}
                </time>
              ) : null}
            </div>
            {step.isCurrent ? (
              <p className="mt-1 text-xs text-muted-foreground">{labels.current}</p>
            ) : null}
          </li>
        ))}
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
