"use client";

import { useRealtimeContext } from "@/features/realtime/context/realtime-provider";

export function useRealtimeNotifications() {
  const {
    unreadCount,
    notifications,
    isConnected,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRealtimeContext();

  return {
    unreadCount,
    notifications,
    isConnected,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  };
}
