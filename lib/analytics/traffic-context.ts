import { getStoredAttribution } from "@/lib/attribution";
import {
  classifyTraffic,
  toTrafficAnalyticsParams,
} from "@/lib/analytics/traffic-platform";

export function getTrafficAnalyticsContext(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const attribution = getStoredAttribution();

  const classification = classifyTraffic({
    utmSource: attribution.lastTouchSource ?? attribution.firstTouchSource,
    utmMedium: attribution.firstTouchMedium,
    referrer: attribution.referrer,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    ttclid: attribution.ttclid,
  });

  return toTrafficAnalyticsParams(classification);
}

export function getTrafficMetadataForActivity(): Record<string, string> {
  return getTrafficAnalyticsContext();
}
