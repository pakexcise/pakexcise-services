"use client";

import { useEffect, useRef } from "react";

import { markAllAdminInAppNotificationsReadAction } from "@/features/admin/actions/mark-admin-seen-actions";
import { dispatchAdminBadgesRefresh } from "@/lib/admin/admin-badges-refresh";

export function AdminNotificationsPageClientEffects() {
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (hasMarkedRef.current) {
      return;
    }

    hasMarkedRef.current = true;

    void markAllAdminInAppNotificationsReadAction()
      .then(() => {
        dispatchAdminBadgesRefresh();
      })
      .catch(() => undefined);
  }, []);

  return null;
}
