"use client";

import { useEffect, useRef } from "react";

import { pushAnalyticsEvent } from "@/features/analytics/data-layer";

type ApplicationCompletedTrackerProps = {
  applicationId: string;
  serviceSlug?: string;
};

export function ApplicationCompletedTracker({
  applicationId,
  serviceSlug,
}: ApplicationCompletedTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    pushAnalyticsEvent("application_completed", {
      application_id: applicationId,
      ...(serviceSlug ? { service_slug: serviceSlug } : {}),
    });
  }, [applicationId, serviceSlug]);

  return null;
}
