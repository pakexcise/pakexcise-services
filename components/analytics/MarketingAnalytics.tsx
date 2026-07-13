import { Suspense } from "react";

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import {
  GoogleAnalyticsScripts,
  GoogleTagManagerHead,
  GoogleTagManagerNoScript,
} from "@/components/analytics/google-tags";
import { shouldAllowSearchIndexing } from "@/config/env.server";
import { getTrackingSettings } from "@/features/settings/lib/public-settings-cache";
import { buildTrackingRuntimeConfig } from "@/features/settings/lib/tracking-runtime";

/**
 * Public-marketing analytics only.
 * Mounted from `app/(marketing)/layout.tsx` so /admin, /customer, /agent,
 * /support, and auth routes never load GTM/GA4.
 */
export async function MarketingAnalytics() {
  const trackingSettings = await getTrackingSettings();
  const tracking = buildTrackingRuntimeConfig(trackingSettings, {
    productionTrackingEnabled: shouldAllowSearchIndexing(),
  });

  return (
    <>
      <GoogleTagManagerHead />
      <GoogleAnalyticsScripts />
      <GoogleTagManagerNoScript />
      <Suspense fallback={null}>
        <AnalyticsProvider tracking={tracking} />
      </Suspense>
    </>
  );
}
