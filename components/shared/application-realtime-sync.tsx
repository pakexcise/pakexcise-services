"use client";

import { useRouter } from "next/navigation";
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

export function ApplicationRealtimeSync({
  pollIntervalMs = 2000,
}: ApplicationRealtimeSyncProps) {
  const router = useRouter();
  const sinceRef = useRef(Date.now());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleRefresh() {
      if (refreshTimerRef.current) {
        return;
      }

      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        router.refresh();
      }, 150);
    }

    const unsubscribe = subscribeToApplicationUpdates(scheduleRefresh);

    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function pollForUpdates() {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch(
          `/api/realtime/applications?since=${sinceRef.current}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          version?: number;
          events?: unknown[];
        };

        if (Array.isArray(data.events) && data.events.length > 0) {
          sinceRef.current =
            typeof data.version === "number"
              ? data.version
              : Date.now();
          scheduleRefresh();
        }
      } catch {
        // Ignore transient network errors; next poll will retry.
      }
    }

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
  }, [pollIntervalMs, router]);

  return null;
}

export { broadcastApplicationUpdate };
