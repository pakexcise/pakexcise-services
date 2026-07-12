"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";

export function AdminInAppNotificationsPanel() {
    return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{"In-app notifications"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{"Unread platform events for new applications, uploads, and customer actions."}</p>
        </div>
        <NotificationBell applicationBasePath="/admin/applications" />
      </div>
      <p className="text-sm text-muted-foreground">{"Use the bell to view unread alerts, mark them read, and open the related application."}</p>
    </section>
  );
}
