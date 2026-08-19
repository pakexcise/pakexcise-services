import { isPublicAnalyticsPath } from "@/features/tracking/lib/public-analytics-path";

declare global {
  interface Window {
    __PAKEXCISE_EXCLUDE_MARKETING_PIXELS__?: boolean;
  }
}

export function setMarketingPixelsExcluded(excluded: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  window.__PAKEXCISE_EXCLUDE_MARKETING_PIXELS__ = excluded;
}

export function isMarketingPixelsExcluded(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.__PAKEXCISE_EXCLUDE_MARKETING_PIXELS__ === true;
}

/** True when GA4/GTM/Meta/TikTok marketing pixels may fire for this path/user. */
export function shouldSendMarketingPixelEvent(pathname?: string): boolean {
  if (isMarketingPixelsExcluded()) {
    return false;
  }

  const path =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");

  return isPublicAnalyticsPath(path);
}
