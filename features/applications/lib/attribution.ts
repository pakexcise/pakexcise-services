"use client";

import type { ApplicationAttributionInput } from "@/features/applications/types";

const STORAGE_KEY = "pakexcise.attribution";

type StoredAttribution = ApplicationAttributionInput & {
  capturedAt: string;
};

function readSearchParams(): URLSearchParams | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search);
}

function getDeviceType(): string {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const width = window.innerWidth;
  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

export function captureAttributionFromUrl(): ApplicationAttributionInput {
  const params = readSearchParams();

  if (!params) {
    return {};
  }

  const current: ApplicationAttributionInput = {
    firstTouchSource: params.get("utm_source") ?? undefined,
    firstTouchMedium: params.get("utm_medium") ?? undefined,
    firstTouchCampaign: params.get("utm_campaign") ?? undefined,
    lastTouchSource: params.get("utm_source") ?? undefined,
    lastTouchCampaign: params.get("utm_campaign") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    fbclid: params.get("fbclid") ?? undefined,
    ttclid: params.get("ttclid") ?? undefined,
    landingPage:
      typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer:
      typeof document !== "undefined" ? document.referrer || undefined : undefined,
    deviceType: getDeviceType(),
  };

  const existing = getStoredAttribution();

  const merged: StoredAttribution = {
    firstTouchSource:
      existing.firstTouchSource ?? current.firstTouchSource ?? undefined,
    firstTouchMedium:
      existing.firstTouchMedium ?? current.firstTouchMedium ?? undefined,
    firstTouchCampaign:
      existing.firstTouchCampaign ?? current.firstTouchCampaign ?? undefined,
    lastTouchSource: current.lastTouchSource ?? existing.lastTouchSource,
    lastTouchCampaign:
      current.lastTouchCampaign ?? existing.lastTouchCampaign,
    gclid: current.gclid ?? existing.gclid,
    fbclid: current.fbclid ?? existing.fbclid,
    ttclid: current.ttclid ?? existing.ttclid,
    landingPage: existing.landingPage ?? current.landingPage,
    referrer: existing.referrer ?? current.referrer,
    deviceType: current.deviceType ?? existing.deviceType,
    capturedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return merged;
}

export function getStoredAttribution(): ApplicationAttributionInput {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as StoredAttribution;
    const { capturedAt: _capturedAt, ...attribution } = parsed;
    return attribution;
  } catch {
    return {};
  }
}
