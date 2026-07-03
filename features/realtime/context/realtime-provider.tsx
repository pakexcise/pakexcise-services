"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { broadcastApplicationUpdate } from "@/features/realtime/broadcast-application-update";
import type {
  ApplicationRealtimeListener,
  InAppNotificationListItem,
  RealtimeClientEvent,
} from "@/features/realtime/types";

type RealtimeContextValue = {
  unreadCount: number;
  notifications: InAppNotificationListItem[];
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  subscribeApplicationUpdates: (
    listener: ApplicationRealtimeListener,
  ) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 30_000;

function parseClientEvent(raw: string): RealtimeClientEvent | null {
  try {
    const parsed = JSON.parse(raw) as RealtimeClientEvent;

    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

type RealtimeProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function RealtimeProvider({
  children,
  enabled = true,
}: RealtimeProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<InAppNotificationListItem[]>(
    [],
  );
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef(new Set<ApplicationRealtimeListener>());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/in-app?limit=20", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        items: InAppNotificationListItem[];
        unreadCount: number;
      };

      setNotifications(payload.items ?? []);
      setUnreadCount(payload.unreadCount ?? 0);
    } catch {
      // Realtime notifications are optional; dashboard must still load.
    }
  }, []);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    const response = await fetch(
      `/api/notifications/in-app/${notificationId}/read`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { unreadCount: number };

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );
    setUnreadCount(payload.unreadCount);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const response = await fetch("/api/notifications/in-app/read-all", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);
  }, []);

  const subscribeApplicationUpdates = useCallback(
    (listener: ApplicationRealtimeListener) => {
      listenersRef.current.add(listener);

      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [],
  );

  const handleEvent = useCallback((event: RealtimeClientEvent) => {
    if (event.type === "heartbeat") {
      return;
    }

    if (event.type === "application.updated") {
      for (const listener of listenersRef.current) {
        listener(event);
      }

      broadcastApplicationUpdate();
      return;
    }

    if (event.type === "notification.created") {
      setUnreadCount(event.unreadCount);
      setNotifications((current) => {
        const nextItem: InAppNotificationListItem = {
          id: event.notificationId,
          applicationId: event.applicationId,
          title: event.title,
          message: event.message,
          isRead: false,
          createdAt: event.createdAt,
          trackingId: null,
        };

        const withoutDuplicate = current.filter(
          (item) => item.id !== nextItem.id,
        );

        return [nextItem, ...withoutDuplicate].slice(0, 20);
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void refreshNotifications();
    }, 0);

    let source: EventSource | null = null;
    let disposed = false;

    const connect = () => {
      if (disposed) {
        return;
      }

      source?.close();
      source = new EventSource("/api/realtime/stream", {
        withCredentials: true,
      });

      source.onopen = () => {
        reconnectAttemptRef.current = 0;
        setIsConnected(true);
      };

      source.onmessage = (message) => {
        const event = parseClientEvent(message.data);

        if (event) {
          handleEvent(event);
        }
      };

      source.addEventListener("application.updated", (message) => {
        const event = parseClientEvent((message as MessageEvent<string>).data);

        if (event?.type === "application.updated") {
          handleEvent(event);
        }
      });

      source.addEventListener("notification.created", (message) => {
        const event = parseClientEvent((message as MessageEvent<string>).data);

        if (event?.type === "notification.created") {
          handleEvent(event);
        }
      });

      source.addEventListener("heartbeat", () => {
        // Keep-alive only.
      });

      source.onerror = () => {
        setIsConnected(false);
        source?.close();
        source = null;

        if (disposed) {
          return;
        }

        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** reconnectAttemptRef.current,
          RECONNECT_MAX_MS,
        );
        reconnectAttemptRef.current += 1;

        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      disposed = true;
      setIsConnected(false);
      window.clearTimeout(loadTimer);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      source?.close();
    };
  }, [enabled, handleEvent, refreshNotifications]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      unreadCount,
      notifications,
      isConnected,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      subscribeApplicationUpdates,
    }),
    [
      unreadCount,
      notifications,
      isConnected,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      subscribeApplicationUpdates,
    ],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtimeContext must be used within RealtimeProvider");
  }

  return context;
}
