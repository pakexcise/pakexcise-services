/**
 * Client-side GA4 helpers.
 * Uses dataLayer so events queue correctly before gtag.js finishes loading.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function ensureDataLayer(): Array<Record<string, unknown>> {
  if (typeof window === "undefined") {
    return [];
  }

  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer as Array<Record<string, unknown>>;
}

/** Stub gtag immediately so early page_view calls are not dropped. */
export function ensureGtagStub(): void {
  if (typeof window === "undefined") {
    return;
  }

  ensureDataLayer();

  if (typeof window.gtag === "function") {
    return;
  }

  window.gtag = (...args: unknown[]) => {
    ensureDataLayer().push(args as unknown as Record<string, unknown>);
  };
}

export function pushGtagCommand(...args: unknown[]): void {
  ensureGtagStub();
  window.gtag!(...args);
}
