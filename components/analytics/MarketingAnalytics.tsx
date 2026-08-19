import Script from "next/script";
import { Suspense } from "react";

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import {
  GoogleAnalyticsScripts,
  GoogleTagManagerHead,
  GoogleTagManagerNoScript,
} from "@/components/analytics/google-tags";
import { shouldAllowSearchIndexing } from "@/config/env.server";
import { shouldExcludeUserFromMarketingPixels } from "@/features/analytics/lib/marketing-pixels-eligibility";
import { getTrackingSettings } from "@/features/settings/lib/public-settings-cache";
import { buildTrackingRuntimeConfig } from "@/features/settings/lib/tracking-runtime";
import { getCurrentUser } from "@/server/auth/current-user";

/**
 * Public-marketing analytics only.
 * Mounted from `app/(marketing)/layout.tsx` so /admin, /customer, /agent,
 * /support, and auth routes never load GTM/GA4.
 *
 * Logged-in staff (admin, support, agent) are excluded so QA does not pollute GA4.
 */
export async function MarketingAnalytics() {
  const [trackingSettings, user] = await Promise.all([
    getTrackingSettings(),
    getCurrentUser(),
  ]);

  const tracking = buildTrackingRuntimeConfig(trackingSettings, {
    productionTrackingEnabled: shouldAllowSearchIndexing(),
  });

  const excludeMarketingPixels = shouldExcludeUserFromMarketingPixels(
    user ? { role: user.role, impersonatedBy: user.impersonatedBy } : null,
  );

  return (
    <>
      {excludeMarketingPixels ? (
        <Script id="pakexcise-analytics-exclude" strategy="beforeInteractive">
          {"window.__PAKEXCISE_EXCLUDE_MARKETING_PIXELS__=true;"}
        </Script>
      ) : null}
      {!excludeMarketingPixels ? (
        <>
          <GoogleTagManagerHead />
          <GoogleAnalyticsScripts />
          <GoogleTagManagerNoScript />
        </>
      ) : null}
      <Suspense fallback={null}>
        <AnalyticsProvider
          tracking={tracking}
          excludeMarketingPixels={excludeMarketingPixels}
        />
      </Suspense>
    </>
  );
}
