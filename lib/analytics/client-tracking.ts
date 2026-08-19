import { ensureGtagStub, pushGtagCommand } from "@/lib/analytics/gtag-client";
import { shouldSendMarketingPixelEvent } from "@/lib/analytics/marketing-pixels-client";

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

export function pushGa4PageView(
  ga4Id: string,
  pagePath: string,
  extra: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined" || !shouldSendMarketingPixelEvent()) {
    return;
  }

  ensureGtagStub();

  pushGtagCommand("config", ga4Id, {
    page_path: pagePath,
    send_page_view: false,
    ...extra,
  });

  pushGtagCommand("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    ...extra,
  });
}

export function pushGtmPageView(
  pagePath: string,
  extra: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined" || !shouldSendMarketingPixelEvent()) {
    return;
  }

  ensureGtagStub();

  window.dataLayer!.push({
    event: "page_view",
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    ...extra,
  });
}
