"use client";

import { useEffect, useRef } from "react";

import { pushAnalyticsEvent } from "@/features/analytics/data-layer";
import { recordClientActivity } from "@/features/tracking/lib/record-client-activity";

type ViewServiceTrackerProps = {
  serviceSlug: string;
  serviceId: string;
};

export function ViewServiceTracker({
  serviceSlug,
  serviceId,
}: ViewServiceTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    pushAnalyticsEvent("view_service", {
      service_slug: serviceSlug,
      service_id: serviceId,
    });
    recordClientActivity({
      event: "service_view",
      metadata: {
        service_slug: serviceSlug,
        service_id: serviceId,
      },
    });
  }, [serviceId, serviceSlug]);

  return null;
}
