"use client";

import type {
  AnalyticsEventName,
  AnalyticsEventPayload,
  SafeAnalyticsValue,
} from "@/features/analytics/events";
import {
  normalizeAnalyticsKey,
  sanitizeAnalyticsPayload,
} from "@/features/analytics/sanitize-payload";
import {
  getStoredAttribution,
  toAttributionAnalyticsContext,
} from "@/lib/attribution";
import { pushGtagCommand } from "@/lib/analytics/gtag-client";
import { shouldSendMarketingPixelEvent } from "@/lib/analytics/marketing-pixels-client";
import { getTrafficAnalyticsContext } from "@/lib/analytics/traffic-context";

export type DataLayerEvent = {
  event: AnalyticsEventName;
  event_id: string;
  event_time: number;
  [key: string]: SafeAnalyticsValue;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, payload?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

export function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureDataLayer(): Array<Record<string, unknown>> {
  if (typeof window === "undefined") {
    return [];
  }

  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

function mapGa4EventName(event: AnalyticsEventName): string {
  return event;
}

function mapMetaEventName(event: AnalyticsEventName): string | null {
  switch (event) {
    case "submit_application":
      return "Lead";
    case "start_application":
      return "InitiateCheckout";
    case "payment_uploaded":
      return "AddPaymentInfo";
    case "application_completed":
      return "CompleteRegistration";
    case "view_service":
      return "ViewContent";
    case "click_whatsapp":
      return "Contact";
    default:
      return "CustomEvent";
  }
}

function mapTikTokEventName(event: AnalyticsEventName): string {
  switch (event) {
    case "submit_application":
      return "SubmitApplication";
    case "payment_uploaded":
      return "AddPaymentInfo";
    case "application_completed":
      return "CompleteRegistration";
    case "view_service":
      return "ViewContent";
    case "click_whatsapp":
      return "Contact";
    default:
      return "CustomEvent";
  }
}

function pushVendorEvents(
  event: AnalyticsEventName,
  eventId: string,
  payload: Record<string, SafeAnalyticsValue>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();

  if (ga4MeasurementId) {
    pushGtagCommand("event", mapGa4EventName(event), {
      ...payload,
      event_id: eventId,
      send_to: ga4MeasurementId,
    });
  }

  if (typeof window.fbq === "function") {
    const metaEvent = mapMetaEventName(event);
    if (metaEvent === "CustomEvent") {
      window.fbq("trackCustom", event, { ...payload, event_id: eventId });
    } else {
      window.fbq("track", metaEvent, { ...payload, event_id: eventId });
    }
  }

  if (window.ttq?.track) {
    window.ttq.track(mapTikTokEventName(event), {
      ...payload,
      event_id: eventId,
    });
  }
}

export function pushAnalyticsEvent<T extends AnalyticsEventName>(
  event: T,
  payload: AnalyticsEventPayload<T>,
  options?: { eventId?: string; includeAttribution?: boolean },
): string {
  const eventId = options?.eventId ?? generateEventId();

  if (!shouldSendMarketingPixelEvent()) {
    return eventId;
  }

  const sanitized = sanitizeAnalyticsPayload(
    payload as Record<string, unknown>,
  );
  const attribution =
    options?.includeAttribution === false
      ? {}
      : {
          ...toAttributionAnalyticsContext(getStoredAttribution()),
          ...getTrafficAnalyticsContext(),
        };

  const dataLayerEvent: DataLayerEvent = {
    event,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    ...attribution,
    ...sanitized,
  };

  const layer = ensureDataLayer();
  layer.push(dataLayerEvent);
  pushVendorEvents(event, eventId, {
    ...attribution,
    ...sanitized,
  });

  return eventId;
}

export function parseElementAnalyticsPayload(
  element: HTMLElement,
): Record<string, SafeAnalyticsValue> {
  const payload: Record<string, SafeAnalyticsValue> = {};

  for (const attr of Array.from(element.attributes)) {
    if (!attr.name.startsWith("data-analytics-") || attr.name === "data-analytics-event") {
      continue;
    }

    const key = attr.name.replace("data-analytics-", "");
    payload[normalizeAnalyticsKey(key)] = attr.value;
  }

  return sanitizeAnalyticsPayload(payload);
}
