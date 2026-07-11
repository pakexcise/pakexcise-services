"use client";

import { useEffect } from "react";

import { pushAnalyticsEvent } from "@/features/analytics/data-layer";
import { recordClientActivity } from "@/features/tracking/lib/record-client-activity";
import { captureAndGetTrafficAnalyticsContext } from "@/lib/analytics/traffic-context";

type ViewServiceTrackerProps = {
  serviceSlug: string;
  serviceId: string;
};

export function ViewServiceTracker({
  serviceSlug,
  serviceId,
}: ViewServiceTrackerProps) {
  useEffect(() => {
    const dedupeKey = `pe_sv:${serviceSlug}`;
    try {
      const last = sessionStorage.getItem(dedupeKey);
      const now = Date.now();
      // Dedupe React Strict Mode remount + accidental double fire within 5s.
      if (last && now - Number(last) < 5000) {
        return;
      }
      sessionStorage.setItem(dedupeKey, String(now));
    } catch {
      // sessionStorage unavailable — still record once this mount
    }

    pushAnalyticsEvent("view_service", {
      service_slug: serviceSlug,
      service_id: serviceId,
    });
    recordClientActivity({
      event: "service_view",
      metadata: {
        ...captureAndGetTrafficAnalyticsContext(),
        service_slug: serviceSlug,
        service_id: serviceId,
      },
    });
  }, [serviceId, serviceSlug]);

  return null;
}
