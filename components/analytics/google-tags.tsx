import Script from "next/script";

import { getProductionTrackingIds } from "@/lib/analytics/production-tracking";

/**
 * Marketing-only Google tags.
 *
 * Prefer GTM when configured (GTM owns the GA4 tag in the container).
 * Fall back to direct gtag only when GA4 is set without GTM — avoids double page_view.
 *
 * Initial automatic page_view is disabled; MarketingAnalytics / AnalyticsProvider
 * sends page_view with traffic_channel / traffic_platform after classification.
 */
export function GoogleAnalyticsScripts() {
  const tracking = getProductionTrackingIds();
  const ga4Id = tracking?.ga4MeasurementId;
  const gtmId = tracking?.gtmId;

  // When GTM is present, GA4 should fire from the GTM container — not a second gtag bootstrap.
  if (!ga4Id || gtmId) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}', {
            send_page_view: false,
            page_type: 'public'
          });
        `}
      </Script>
    </>
  );
}

export function GoogleTagManagerHead() {
  const tracking = getProductionTrackingIds();
  const gtmId = tracking?.gtmId;

  if (!gtmId) {
    return null;
  }

  return (
    <Script id="google-tag-manager" strategy="lazyOnload">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];
w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js', page_type:'public'});
var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
    </Script>
  );
}

export function GoogleTagManagerNoScript() {
  const tracking = getProductionTrackingIds();
  const gtmId = tracking?.gtmId;

  if (!gtmId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
