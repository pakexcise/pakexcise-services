"use client";

export type ApplicationAnalyticsEvent =
  | "start_application"
  | "complete_step"
  | "upload_document"
  | "submit_application";

type AnalyticsPayload = Record<string, string | number | boolean>;

function pushToDataLayer(event: ApplicationAnalyticsEvent, payload: AnalyticsPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const w = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({
    event,
    ...payload,
  });
}

export function trackApplicationEvent(
  event: ApplicationAnalyticsEvent,
  payload: AnalyticsPayload,
): void {
  pushToDataLayer(event, payload);
}
