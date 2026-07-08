export function isGoogleTagManagerLoaded(gtmId: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(
    document.getElementById("google-tag-manager") ||
      document.querySelector(`script[src*="gtm.js?id=${gtmId}"]`),
  );
}

export function isGoogleAnalyticsLoaded(ga4Id: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(
    document.getElementById("google-analytics") ||
      document.querySelector(`script[src*="gtag/js?id=${ga4Id}"]`),
  );
}

export function pushGa4PageView(ga4Id: string, pagePath: string): void {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("config", ga4Id, {
    page_path: pagePath,
  });
}

export function pushGtmPageView(pagePath: string): void {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "page_view",
    page_path: pagePath,
  });
}
