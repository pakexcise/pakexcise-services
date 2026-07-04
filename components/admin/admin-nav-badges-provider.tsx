"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AdminNavBadgeCounts } from "@/features/admin/types/nav-badges";
import { useRealtimeContext } from "@/features/realtime/context/realtime-provider";
import { ADMIN_BADGES_REFRESH_EVENT } from "@/lib/admin/admin-badges-refresh";

const AdminNavBadgesContext = createContext<AdminNavBadgeCounts | null>(null);

type AdminNavBadgesProviderProps = {
  initialCounts: AdminNavBadgeCounts;
  children: ReactNode;
};

export function AdminNavBadgesProvider({
  initialCounts,
  children,
}: AdminNavBadgesProviderProps) {
  const { unreadCount, subscribeApplicationUpdates, refreshNotifications } =
    useRealtimeContext();
  const [pendingApplications, setPendingApplications] = useState(
    initialCounts.pendingApplications,
  );

  const refreshCounts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/nav-badges", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as AdminNavBadgeCounts;
      setPendingApplications(payload.pendingApplications);
    } catch {
      // Badge counts are optional UX; ignore transient failures.
    }
  }, []);

  useEffect(() => {
    return subscribeApplicationUpdates(() => {
      void refreshCounts();
    });
  }, [refreshCounts, subscribeApplicationUpdates]);

  useEffect(() => {
    function handleRefresh() {
      void refreshCounts();
      void refreshNotifications();
    }

    window.addEventListener(ADMIN_BADGES_REFRESH_EVENT, handleRefresh);

    return () => {
      window.removeEventListener(ADMIN_BADGES_REFRESH_EVENT, handleRefresh);
    };
  }, [refreshCounts, refreshNotifications]);

  const counts = useMemo<AdminNavBadgeCounts>(
    () => ({
      unreadNotifications: unreadCount,
      pendingApplications,
    }),
    [pendingApplications, unreadCount],
  );

  return (
    <AdminNavBadgesContext.Provider value={counts}>
      {children}
    </AdminNavBadgesContext.Provider>
  );
}

export function useAdminNavBadges(): AdminNavBadgeCounts {
  const context = useContext(AdminNavBadgesContext);

  if (!context) {
    return {
      unreadNotifications: 0,
      pendingApplications: 0,
    };
  }

  return context;
}
