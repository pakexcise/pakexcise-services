"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { UserRole } from "@prisma/client";

import {
  broadcastApplicationUpdate,
  subscribeToApplicationUpdates,
} from "@/features/realtime/broadcast-application-update";

type ApplicationRealtimeSyncProps = {
  userId: string;
  role: UserRole;
  pollIntervalMs?: number;
};

type RealtimeApplicationEvent = {
  updatedAt: number;
};

const DEFAULT_POLL_INTERVAL_MS = 15_000;

function extractApplicationIdFromPath(pathname: string): string | null {
  const match = pathname.match(
    /\/(?:admin|agent|customer || support)\/applications\/([^/]+)/,
  );

  return match?.[1] ?? null;
}

function resolveNextSince(
  events: RealtimeApplicationEvent[],
  reportedVersion: number | undefined,
  currentSince: number,
): number {
  const latestEventAt = events.reduce(
    (max, event) => Math.max(max, event.updatedAt),
    0,
  );

  return Math.max(currentSince, reportedVersion ?? 0, latestEventAt);
}

export function ApplicationRealtimeSync({
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: ApplicationRealtimeSyncProps) {
  const router = useRouter();
  const pathname = usePathname();
  const applicationId = extractApplicationIdFromPath(pathname);
  const routerRef = useRef(router);
  const sinceRef = useRef(0);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollInFlightRef = useRef(false);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    sinceRef.current = Date.now();
  }, [applicationId]);

  useEffect(() => {
    function scheduleRefresh() {
      if (refreshTimerRef.current) {
        return;
      }

      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        routerRef.current.refresh();
      }, 300);
    }

    const unsubscribe = subscribeToApplicationUpdates(scheduleRefresh);

    if (!applicationId) {
      return () => {
        unsubscribe();
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
      };
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const scopedApplicationId = applicationId;

    async function pollForUpdates() {
      if (
        pollInFlightRef.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      pollInFlightRef.current = true;

      try {
        const response = await fetch(
          `/api/realtime/applications?since=${sinceRef.current}&applicationId=${encodeURIComponent(scopedApplicationId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          version?: number;
          events?: RealtimeApplicationEvent[];
        };

        if (!Array.isArray(data.events) || data.events.length === 0) {
          return;
        }

        sinceRef.current = resolveNextSince(
          data.events,
          data.version,
          sinceRef.current,
        );
        scheduleRefresh();
      } catch {
        // Ignore transient network errors; next poll will retry.
      } finally {
        pollInFlightRef.current = false;
      }
    }

    void pollForUpdates();
    pollTimer = setInterval(pollForUpdates, pollIntervalMs);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void pollForUpdates();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsubscribe();
      if (pollTimer) {
        clearInterval(pollTimer);
      }
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [applicationId, pollIntervalMs]);

  return null;
}

export { broadcastApplicationUpdate };
