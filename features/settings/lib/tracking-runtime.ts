import type { ConsentMode, TrackingSettings } from "@/features/settings/types";
import { resolvePublicTrackingId } from "@/features/settings/lib/public-settings-cache";

export type TrackingRuntimeConfig = {
  ga4MeasurementId?: string;
  gtmId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  consentMode: ConsentMode;
  requireConsentBeforeScripts: boolean;
};

export function buildTrackingRuntimeConfig(
  tracking: TrackingSettings,
): TrackingRuntimeConfig {
  return {
    ga4MeasurementId: resolvePublicTrackingId(
      tracking.ga4MeasurementId,
      process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    ),
    gtmId: resolvePublicTrackingId(
      tracking.gtmId,
      process.env.NEXT_PUBLIC_GTM_ID,
    ),
    metaPixelId: resolvePublicTrackingId(
      tracking.metaPixelId,
      process.env.NEXT_PUBLIC_META_PIXEL_ID,
    ),
    tiktokPixelId: resolvePublicTrackingId(
      tracking.tiktokPixelId,
      process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    ),
    consentMode: tracking.consentMode,
    requireConsentBeforeScripts: tracking.requireConsentBeforeScripts,
  };
}
