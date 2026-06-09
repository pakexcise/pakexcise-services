export type AttributionData = {
  firstTouchSource?: string;
  firstTouchMedium?: string;
  firstTouchCampaign?: string;
  lastTouchSource?: string;
  lastTouchCampaign?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  landingPage?: string;
  referrer?: string;
  deviceType?: string;
};

type StoredAttribution = AttributionData & {
  capturedAt: string;
};

const FIRST_TOUCH_COOKIE = "pe_attr_ft";
const LAST_TOUCH_COOKIE = "pe_attr_lt";
const SESSION_MIRROR_KEY = "pakexcise.attribution";

const FIRST_TOUCH_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
const LAST_TOUCH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const MAX_FIELD_LENGTH = 500;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function trimField(value: string | null | undefined, max = 120): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, max);
}

function readCookie(name: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function parseStoredAttribution(raw: string | null): AttributionData {
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

function getDeviceType(): string {
  if (!isBrowser()) {
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

function readUtmAttribution(): AttributionData {
  if (!isBrowser()) {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const source = trimField(params.get("utm_source"));
  const medium = trimField(params.get("utm_medium"));
  const campaign = trimField(params.get("utm_campaign"));

  const hasTouch =
    Boolean(source) ||
    Boolean(medium) ||
    Boolean(campaign) ||
    Boolean(params.get("gclid")) ||
    Boolean(params.get("fbclid")) ||
    Boolean(params.get("ttclid"));

  if (!hasTouch) {
    return {};
  }

  return {
    firstTouchSource: source,
    firstTouchMedium: medium,
    firstTouchCampaign: campaign,
    lastTouchSource: source,
    lastTouchCampaign: campaign,
    gclid: trimField(params.get("gclid"), 200),
    fbclid: trimField(params.get("fbclid"), 200),
    ttclid: trimField(params.get("ttclid"), 200),
    landingPage: window.location.pathname.slice(0, MAX_FIELD_LENGTH),
    referrer: trimField(document.referrer || undefined, MAX_FIELD_LENGTH),
    deviceType: getDeviceType(),
  };
}

function mergeFirstTouch(
  existing: AttributionData,
  current: AttributionData,
): AttributionData {
  return {
    firstTouchSource: existing.firstTouchSource ?? current.firstTouchSource,
    firstTouchMedium: existing.firstTouchMedium ?? current.firstTouchMedium,
    firstTouchCampaign: existing.firstTouchCampaign ?? current.firstTouchCampaign,
    gclid: existing.gclid ?? current.gclid,
    fbclid: existing.fbclid ?? current.fbclid,
    ttclid: existing.ttclid ?? current.ttclid,
    landingPage: existing.landingPage ?? current.landingPage,
    referrer: existing.referrer ?? current.referrer,
    deviceType: existing.deviceType ?? current.deviceType,
  };
}

function mergeLastTouch(
  existing: AttributionData,
  current: AttributionData,
): AttributionData {
  if (!current.lastTouchSource && !current.gclid && !current.fbclid && !current.ttclid) {
    return existing;
  }

  return {
    ...existing,
    lastTouchSource: current.lastTouchSource ?? existing.lastTouchSource,
    lastTouchCampaign: current.lastTouchCampaign ?? existing.lastTouchCampaign,
    gclid: current.gclid ?? existing.gclid,
    fbclid: current.fbclid ?? existing.fbclid,
    ttclid: current.ttclid ?? existing.ttclid,
    deviceType: current.deviceType ?? existing.deviceType,
  };
}

function persistAttribution(firstTouch: AttributionData, lastTouch: AttributionData): void {
  const capturedAt = new Date().toISOString();

  if (Object.keys(firstTouch).length > 0) {
    writeCookie(
      FIRST_TOUCH_COOKIE,
      JSON.stringify({ ...firstTouch, capturedAt }),
      FIRST_TOUCH_MAX_AGE_SECONDS,
    );
  }

  if (Object.keys(lastTouch).length > 0) {
    writeCookie(
      LAST_TOUCH_COOKIE,
      JSON.stringify({ ...lastTouch, capturedAt }),
      LAST_TOUCH_MAX_AGE_SECONDS,
    );
  }

  const merged = getStoredAttribution();
  window.sessionStorage.setItem(
    SESSION_MIRROR_KEY,
    JSON.stringify({ ...merged, capturedAt }),
  );
}

export function captureAttributionFromUrl(): AttributionData {
  if (!isBrowser()) {
    return {};
  }

  const current = readUtmAttribution();
  const existingFirst = parseStoredAttribution(readCookie(FIRST_TOUCH_COOKIE));
  const existingLast = parseStoredAttribution(readCookie(LAST_TOUCH_COOKIE));

  const firstTouch = mergeFirstTouch(existingFirst, current);
  const lastTouch = mergeLastTouch(existingLast, current);

  if (Object.keys(current).length > 0 || Object.keys(existingFirst).length > 0) {
    persistAttribution(firstTouch, lastTouch);
  } else if (Object.keys(existingFirst).length === 0 && !existingLast.landingPage) {
    const bootstrap: AttributionData = {
      landingPage: window.location.pathname.slice(0, MAX_FIELD_LENGTH),
      referrer: trimField(document.referrer || undefined, MAX_FIELD_LENGTH),
      deviceType: getDeviceType(),
    };
    persistAttribution(bootstrap, bootstrap);
  }

  return getStoredAttribution();
}

export function getStoredAttribution(): AttributionData {
  if (!isBrowser()) {
    return {};
  }

  const firstTouch = parseStoredAttribution(readCookie(FIRST_TOUCH_COOKIE));
  const lastTouch = parseStoredAttribution(readCookie(LAST_TOUCH_COOKIE));

  const merged: AttributionData = {
    firstTouchSource: firstTouch.firstTouchSource,
    firstTouchMedium: firstTouch.firstTouchMedium,
    firstTouchCampaign: firstTouch.firstTouchCampaign,
    lastTouchSource: lastTouch.lastTouchSource ?? firstTouch.lastTouchSource,
    lastTouchCampaign: lastTouch.lastTouchCampaign ?? firstTouch.lastTouchCampaign,
    gclid: lastTouch.gclid ?? firstTouch.gclid,
    fbclid: lastTouch.fbclid ?? firstTouch.fbclid,
    ttclid: lastTouch.ttclid ?? firstTouch.ttclid,
    landingPage: firstTouch.landingPage ?? lastTouch.landingPage,
    referrer: firstTouch.referrer ?? lastTouch.referrer,
    deviceType: lastTouch.deviceType ?? firstTouch.deviceType ?? getDeviceType(),
  };

  const sessionRaw = window.sessionStorage.getItem(SESSION_MIRROR_KEY);
  if (sessionRaw && Object.keys(merged).length === 0) {
    return parseStoredAttribution(sessionRaw);
  }

  return merged;
}

export function toAttributionAnalyticsContext(
  attribution: AttributionData,
): Record<string, string> {
  const context: Record<string, string> = {};

  if (attribution.firstTouchSource) {
    context.first_touch_source = attribution.firstTouchSource;
  }
  if (attribution.firstTouchMedium) {
    context.first_touch_medium = attribution.firstTouchMedium;
  }
  if (attribution.firstTouchCampaign) {
    context.first_touch_campaign = attribution.firstTouchCampaign;
  }
  if (attribution.lastTouchSource) {
    context.last_touch_source = attribution.lastTouchSource;
  }
  if (attribution.lastTouchCampaign) {
    context.last_touch_campaign = attribution.lastTouchCampaign;
  }
  if (attribution.gclid) {
    context.gclid = attribution.gclid;
  }
  if (attribution.fbclid) {
    context.fbclid = attribution.fbclid;
  }
  if (attribution.ttclid) {
    context.ttclid = attribution.ttclid;
  }
  if (attribution.landingPage) {
    context.landing_page = attribution.landingPage;
  }
  if (attribution.referrer) {
    context.referrer = attribution.referrer;
  }
  if (attribution.deviceType) {
    context.device_type = attribution.deviceType;
  }

  return context;
}
