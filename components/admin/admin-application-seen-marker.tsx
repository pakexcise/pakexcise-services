"use client";

import { useEffect, useRef } from "react";

import { markAdminApplicationSeenAction } from "@/features/admin/actions/mark-admin-seen-actions";
import { dispatchAdminBadgesRefresh } from "@/lib/admin/admin-badges-refresh";

type AdminApplicationSeenMarkerProps = {
  applicationId: string;
};

export function AdminApplicationSeenMarker({
  applicationId,
}: AdminApplicationSeenMarkerProps) {
  const markedApplicationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (markedApplicationIdRef.current === applicationId) {
      return;
    }

    markedApplicationIdRef.current = applicationId;

    void markAdminApplicationSeenAction(applicationId)
      .then(() => {
        dispatchAdminBadgesRefresh();
      })
      .catch(() => undefined);
  }, [applicationId]);

  return null;
}
