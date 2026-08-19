import Script from "next/script";

import { getProductionTrackingIds } from "@/lib/analytics/production-tracking";

/**
 * Marketing-only Google tags.
 *
 * GA4 loads directly via gtag.js whenever a measurement ID is configured.
 * GTM is optional and must not be the only path to GA4 — an empty GTM
 * container would otherwise block all analytics.
 *
 * Automatic page_view is disabled; AnalyticsProvider sends page_view with
 * traffic_channel / traffic_platform after classification.
 */
export function GoogleAnalyticsScripts() {
  const tracking = getProductionTrackingIds();
  const ga4Id = tracking?.ga4MeasurementId;

  if (!ga4Id) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}', {
            send_page_view: false,
            page_type: 'public',
            anonymize_ip: true
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
    <Script id="google-tag-manager" strategy="afterInteractive">
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
