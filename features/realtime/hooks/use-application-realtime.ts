"use client";

import { useEffect, useRef } from "react";

import { useRealtimeContext } from "@/features/realtime/context/realtime-provider";
import type {
  ApplicationStatusSnapshot,
  RealtimeApplicationUpdatedEvent,
} from "@/features/realtime/types";

type UseApplicationRealtimeOptions = {
  applicationId: string | null | undefined;
  enabled?: boolean;
  onUpdate?: (event: RealtimeApplicationUpdatedEvent) => void;
  onSnapshot?: (snapshot: ApplicationStatusSnapshot) => void;
};

export function useApplicationRealtime({
  applicationId,
  enabled = true,
  onUpdate,
  onSnapshot,
}: UseApplicationRealtimeOptions) {
  const { subscribeApplicationUpdates } = useRealtimeContext();
  const onUpdateRef = useRef(onUpdate);
  const onSnapshotRef = useRef(onSnapshot);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onSnapshotRef.current = onSnapshot;
  }, [onSnapshot, onUpdate]);

  useEffect(() => {
    if (!enabled || !applicationId) {
      return;
    }

    return subscribeApplicationUpdates((event) => {
      if (event.applicationId !== applicationId) {
        return;
      }

      onUpdateRef.current?.(event);

      const now = Date.now();

      if (now - lastFetchRef.current < 500) {
        return;
      }

      lastFetchRef.current = now;

      void fetch(`/api/applications/${applicationId}/snapshot`, {
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
            onSnapshotRef.current?.(snapshot);
          }
        })
        .catch(() => {
          // Ignore transient network errors.
        });
    });
  }, [applicationId, enabled, subscribeApplicationUpdates]);
}
