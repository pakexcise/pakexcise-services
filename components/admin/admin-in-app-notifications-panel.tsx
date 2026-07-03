"use client";

import { useTranslations } from "next-intl";

import { NotificationBell } from "@/components/notifications/notification-bell";

export function AdminInAppNotificationsPanel() {
  const t = useTranslations("admin.inAppNotifications");

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <NotificationBell applicationBasePath="/admin/applications" />
      </div>
      <p className="text-sm text-muted-foreground">{t("hint")}</p>
    </section>
  );
}
