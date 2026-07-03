"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CustomerApplicationsPanel,
  type CustomerApplicationRow,
} from "@/components/customer/customer-applications-panel";
import type { CustomerNextAction } from "@/features/customer/lib/next-action";
import { useCustomerApplicationLabels } from "@/features/customer/hooks/use-customer-application-labels";
import { useRealtimeContext } from "@/features/realtime/context/realtime-provider";
import type { ApplicationStatusSnapshot } from "@/features/realtime/types";

type CustomerApplicationsLivePanelProps = {
  initialApplications: CustomerApplicationRow[];
  title: string;
  countLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;
  emptyCtaHref: string;
  gettingStartedSteps: Array<{ title: string; description: string }>;
  labels: {
    trackingId: string;
    service: string;
    status: string;
    nextAction: string;
    updated: string;
    actions: string;
    viewApplication: string;
  };
};

export function CustomerApplicationsLivePanel({
  initialApplications,
  ...panelProps
}: CustomerApplicationsLivePanelProps) {
  const { subscribeApplicationUpdates } = useRealtimeContext();
  const { resolveStatusLabel, resolveNextActionLabel, formatUpdatedAt } =
    useCustomerApplicationLabels();
  const [applications, setApplications] =
    useState<CustomerApplicationRow[]>(initialApplications);
  const fetchTimestampsRef = useRef<Map<string, number>>(new Map());

  const applicationIds = useMemo(
    () => new Set(applications.map((application) => application.id)),
    [applications],
  );

  const updateRowFromSnapshot = useCallback(
    (snapshot: ApplicationStatusSnapshot) => {
      setApplications((current) =>
        current.map((row) => {
          if (row.id !== snapshot.applicationId) {
            return row;
          }

          const nextAction = (snapshot.nextAction ??
            row.nextAction) as CustomerNextAction;

          return {
            ...row,
            status: snapshot.status as ApplicationStatus,
            statusLabel:
              snapshot.statusLabelText ??
              resolveStatusLabel(snapshot.status),
            nextAction,
            nextActionLabel:
              snapshot.nextActionLabelText ??
              resolveNextActionLabel(nextAction),
            updatedAt:
              snapshot.formattedUpdatedAt ?? formatUpdatedAt(snapshot.updatedAt),
          };
        }),
      );
    },
    [formatUpdatedAt, resolveNextActionLabel, resolveStatusLabel],
  );

  useEffect(() => {
    return subscribeApplicationUpdates((event) => {
      if (!applicationIds.has(event.applicationId)) {
        return;
      }

      const now = Date.now();
      const lastFetch = fetchTimestampsRef.current.get(event.applicationId) ?? 0;

      if (now - lastFetch < 500) {
        return;
      }

      fetchTimestampsRef.current.set(event.applicationId, now);

      void fetch(`/api/applications/${event.applicationId}/snapshot`, {
        cache: "no-store",
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) {
            return null;
          }

          return (await response.json()) as ApplicationStatusSnapshot;
        })
        .then((snapshot) => {
          if (snapshot) {
            updateRowFromSnapshot(snapshot);
          }
        })
        .catch(() => undefined);
    });
  }, [applicationIds, subscribeApplicationUpdates, updateRowFromSnapshot]);

  return <CustomerApplicationsPanel applications={applications} {...panelProps} />;
}
