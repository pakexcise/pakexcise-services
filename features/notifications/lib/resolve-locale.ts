import type { NotificationLocale } from "@/features/notifications/types";

export function normalizeNotificationLocale(value?: string | null): NotificationLocale {
  return value === "ur" ? "ur" : "en";
}
