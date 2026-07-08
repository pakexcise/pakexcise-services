"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  parseElementAnalyticsPayload,
  pushAnalyticsEvent,
} from "@/features/analytics/data-layer";
import type { AnalyticsEventName } from "@/features/analytics/events";
import type { TrackingRuntimeConfig } from "@/features/settings/lib/tracking-runtime";
import { mapAnalyticsEventToActivity } from "@/features/tracking/lib/map-analytics-event";
import { recordClientActivity } from "@/features/tracking/lib/record-client-activity";
import {
  isGoogleAnalyticsLoaded,
  isGoogleTagManagerLoaded,
  pushGa4PageView,
  pushGtmPageView,
} from "@/lib/analytics/client-tracking";
import { captureAttributionFromUrl } from "@/lib/attribution";

const CONSENT_STORAGE_KEY = "pakexcise.analytics.consent";

function hasAnalyticsConsent(tracking?: TrackingRuntimeConfig): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (tracking?.consentMode === "disabled") {
    return false;
  }

  const consent = window.localStorage.getItem(CONSENT_STORAGE_KEY);

  if (tracking?.consentMode === "explicit" || tracking?.requireConsentBeforeScripts) {
    return consent === "granted";
  }

  return consent !== "denied";
}

function scheduleIdleTask(task: () => void): void {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => task(), { timeout: 3000 });
    return;
  }

  window.setTimeout(task, 1500);
}

function injectScript(id: string, src: string): void {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function loadThirdPartyScripts(tracking?: TrackingRuntimeConfig): void {
  if (!hasAnalyticsConsent(tracking)) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];

  const gtmId = tracking?.gtmId;
  const ga4Id = tracking?.ga4MeasurementId;
  const metaPixelId = tracking?.metaPixelId;
  const tiktokPixelId = tracking?.tiktokPixelId;

  if (gtmId && !isGoogleTagManagerLoaded(gtmId)) {
    window.dataLayer.push({
      event: "gtm.js",
      event_id: `gtm_${Date.now()}`,
      event_time: Math.floor(Date.now() / 1000),
      "gtm.start": Date.now(),
    });
    injectScript("pakexcise-gtm", `https://www.googletagmanager.com/gtm.js?id=${gtmId}`);
  }

  if (ga4Id && !isGoogleAnalyticsLoaded(ga4Id)) {
    injectScript(
      "pakexcise-gtag",
      `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`,
    );

    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args as never);
    };

    window.gtag("js", new Date());
    window.gtag("config", ga4Id, { send_page_view: true });
  }

  if (metaPixelId) {
    type FbqStub = ((...args: unknown[]) => void) & {
      queue: unknown[][];
      loaded: boolean;
      version: string;
    };

    if (!window.fbq) {
      const fbq = ((...args: unknown[]) => {
        fbq.queue.push(args);
      }) as FbqStub;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
    }

    injectScript(
      "pakexcise-meta-pixel",
      "https://connect.facebook.net/en_US/fbevents.js",
    );
    window.fbq("init", metaPixelId);
  }

  if (tiktokPixelId) {
    const ttq = window.ttq ?? {
      page: () => undefined,
      track: () => undefined,
    };

    window.ttq = ttq;
    injectScript(
      "pakexcise-tiktok-pixel",
      `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${tiktokPixelId}&lib=ttq`,
    );
  }
}

function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return [
    "view_service",
    "click_whatsapp",
    "start_application",
    "complete_step",
    "upload_document",
    "submit_application",
    "invoice_viewed",
    "payment_uploaded",
    "application_completed",
    "click_social_link",
  ].includes(value);
}

type AnalyticsProviderProps = {
  children: React.ReactNode;
  tracking?: TrackingRuntimeConfig;
};

export function AnalyticsProvider({ children, tracking }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    captureAttributionFromUrl();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!hasAnalyticsConsent(tracking)) {
      return;
    }

    const ga4Id = tracking?.ga4MeasurementId;
    const gtmId = tracking?.gtmId;

    if (!ga4Id && !gtmId) {
      return;
    }

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (ga4Id) {
      pushGa4PageView(ga4Id, pagePath);
    }

    if (gtmId) {
      pushGtmPageView(pagePath);
    }

    recordClientActivity({
      event: "page_view",
      path: pagePath,
    });
  }, [pathname, searchParams, tracking]);

  useEffect(() => {
    if (scriptsLoadedRef.current) {
      return;
    }

    const load = () => {
      if (scriptsLoadedRef.current) {
        return;
      }

      scriptsLoadedRef.current = true;
      scheduleIdleTask(() => loadThirdPartyScripts(tracking));
    };

    if (document.readyState === "complete") {
      load();
      return;
    }

    window.addEventListener("load", load, { once: true });
    return () => window.removeEventListener("load", load);
  }, [tracking]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest<HTMLElement>("[data-analytics-event]");

      if (!element) {
        return;
      }

      const eventName = element.dataset.analyticsEvent;

      if (!eventName || !isAnalyticsEventName(eventName)) {
        return;
      }

      const payload = parseElementAnalyticsPayload(element);
      pushAnalyticsEvent(eventName, payload as never);

      const activityEvent = mapAnalyticsEventToActivity(eventName);

      if (activityEvent) {
        recordClientActivity({
          event: activityEvent,
          metadata: payload as Record<string, string | number | boolean>,
        });
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return children;
}
