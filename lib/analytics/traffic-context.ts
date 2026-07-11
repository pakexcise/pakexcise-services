import { getStoredAttribution, captureAttributionFromUrl } from "@/lib/attribution";
import {
  classifyTraffic,
  toTrafficAnalyticsParams,
} from "@/lib/analytics/traffic-platform";

function resolveReferrerForClassification(
  storedReferrer: string | undefined,
): string | undefined {
  if (typeof window === "undefined") {
    return storedReferrer;
  }

  const liveReferrer = document.referrer?.trim() || undefined;
  const candidate = storedReferrer || liveReferrer;

  if (!candidate) {
    return undefined;
  }

  try {
    const refHost = new URL(candidate).hostname.replace(/^www\./i, "").toLowerCase();
    const selfHost = window.location.hostname.replace(/^www\./i, "").toLowerCase();
    if (refHost === selfHost || refHost.endsWith(`.${selfHost}`)) {
      return undefined;
    }
  } catch {
    // keep candidate
  }

  return candidate;
}

/** Build traffic_* metadata for activity events and GA. Call after captureAttributionFromUrl. */
export function getTrafficAnalyticsContext(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const attribution = getStoredAttribution();
  const params = new URLSearchParams(window.location.search);

  const utmSource =
    params.get("utm_source")?.trim() ||
    attribution.lastTouchSource ||
    attribution.firstTouchSource ||
    undefined;

  const utmMedium =
    params.get("utm_medium")?.trim() ||
    attribution.firstTouchMedium ||
    undefined;

  const classification = classifyTraffic({
    utmSource,
    utmMedium,
    referrer: resolveReferrerForClassification(attribution.referrer),
    gclid: params.get("gclid")?.trim() || attribution.gclid,
    fbclid: params.get("fbclid")?.trim() || attribution.fbclid,
    ttclid: params.get("ttclid")?.trim() || attribution.ttclid,
  });

  return toTrafficAnalyticsParams(classification);
}

export function getTrafficMetadataForActivity(): Record<string, string> {
  return getTrafficAnalyticsContext();
}

/** Ensure cookies are captured, then return traffic metadata. */
export function captureAndGetTrafficAnalyticsContext(): Record<string, string> {
  captureAttributionFromUrl();
  return getTrafficAnalyticsContext();
}
