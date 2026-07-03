"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useCallback, useState } from "react";

import { StatusTimeline } from "@/components/customer/StatusTimeline";
import { useApplicationRealtime } from "@/features/realtime/hooks/use-application-realtime";
import type { ApplicationStatusSnapshot } from "@/features/realtime/types";

type TimelineEntry = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  createdAt: Date | string;
};

type CustomerApplicationLiveTimelineProps = {
  applicationId: string;
  initialEntries: TimelineEntry[];
  initialCurrentStatus: ApplicationStatus;
  locale: string;
  labels: {
    title: string;
    empty: string;
    current: string;
  };
  statusLabel: (status: ApplicationStatus) => string;
};

export function CustomerApplicationLiveTimeline({
  applicationId,
  initialEntries,
  initialCurrentStatus,
  locale,
  labels,
  statusLabel,
}: CustomerApplicationLiveTimelineProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [currentStatus, setCurrentStatus] = useState(initialCurrentStatus);

  const handleSnapshot = useCallback((snapshot: ApplicationStatusSnapshot) => {
    setCurrentStatus(snapshot.status as ApplicationStatus);
    setEntries(
      snapshot.statusHistory.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        createdAt: entry.createdAt,
      })),
    );
  }, []);

  useApplicationRealtime({
    applicationId,
    onSnapshot: handleSnapshot,
  });

  return (
    <StatusTimeline
      entries={entries}
      currentStatus={currentStatus}
      locale={locale}
      labels={labels}
      statusLabel={statusLabel}
    />
  );
}
