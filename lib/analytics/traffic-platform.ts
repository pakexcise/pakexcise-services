export type TrafficChannel =
  | "paid"
  | "social"
  | "ai"
  | "search"
  | "email"
  | "referral"
  | "direct";

export type TrafficClassification = {
  channel: TrafficChannel;
  platform: string;
  source?: string;
  medium?: string;
};

type ClassifyTrafficInput = {
  utmSource?: string;
  utmMedium?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
};

type HostRule = {
  pattern: RegExp;
  channel: TrafficChannel;
  platform: string;
  medium?: string;
};

const HOST_RULES: HostRule[] = [
  { pattern: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/i, channel: "ai", platform: "chatgpt", medium: "ai" },
  { pattern: /(^|\.)perplexity\.ai$/i, channel: "ai", platform: "perplexity", medium: "ai" },
  { pattern: /(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/i, channel: "ai", platform: "gemini", medium: "ai" },
  { pattern: /(^|\.)claude\.ai$/i, channel: "ai", platform: "claude", medium: "ai" },
  { pattern: /(^|\.)copilot\.microsoft\.com$/i, channel: "ai", platform: "copilot", medium: "ai" },
  { pattern: /(^|\.)you\.com$/i, channel: "ai", platform: "you", medium: "ai" },
  { pattern: /(^|\.)phind\.com$/i, channel: "ai", platform: "phind", medium: "ai" },
  { pattern: /(^|\.)poe\.com$/i, channel: "ai", platform: "poe", medium: "ai" },
  { pattern: /(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)m\.facebook\.com$/i, channel: "social", platform: "facebook", medium: "social" },
  { pattern: /(^|\.)instagram\.com$/i, channel: "social", platform: "instagram", medium: "social" },
  { pattern: /(^|\.)tiktok\.com$/i, channel: "social", platform: "tiktok", medium: "social" },
  { pattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/i, channel: "social", platform: "twitter", medium: "social" },
  { pattern: /(^|\.)linkedin\.com$/i, channel: "social", platform: "linkedin", medium: "social" },
  { pattern: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, channel: "social", platform: "youtube", medium: "social" },
  { pattern: /(^|\.)pinterest\.com$/i, channel: "social", platform: "pinterest", medium: "social" },
  { pattern: /(^|\.)reddit\.com$/i, channel: "social", platform: "reddit", medium: "social" },
  { pattern: /(^|\.)threads\.net$/i, channel: "social", platform: "threads", medium: "social" },
  { pattern: /(^|\.)snapchat\.com$/i, channel: "social", platform: "snapchat", medium: "social" },
  { pattern: /(^|\.)google\./i, channel: "search", platform: "google", medium: "organic" },
  { pattern: /(^|\.)bing\.com$/i, channel: "search", platform: "bing", medium: "organic" },
  { pattern: /(^|\.)yahoo\.com$/i, channel: "search", platform: "yahoo", medium: "organic" },
  { pattern: /(^|\.)duckduckgo\.com$/i, channel: "search", platform: "duckduckgo", medium: "organic" },
];

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

export function parseReferrerHost(referrer: string | undefined): string | undefined {
  if (!referrer?.trim()) {
    return undefined;
  }

  try {
    return normalizeHost(new URL(referrer).hostname);
  } catch {
    return undefined;
  }
}

function matchHostRule(host: string): HostRule | undefined {
  return HOST_RULES.find((rule) => rule.pattern.test(host));
}

function normalizeUtmValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim().toLowerCase();
  return trimmed || undefined;
}

function classifyFromUtm(
  utmSource: string | undefined,
  utmMedium: string | undefined,
): TrafficClassification | null {
  if (!utmSource) {
    return null;
  }

  const medium = utmMedium ?? "referral";

  if (["cpc", "ppc", "paid", "paidsearch", "display", "paidsocial"].includes(medium)) {
    return {
      channel: "paid",
      platform: utmSource,
      source: utmSource,
      medium,
    };
  }

  if (medium === "email") {
    return {
      channel: "email",
      platform: utmSource,
      source: utmSource,
      medium,
    };
  }

  if (medium === "social" || medium === "social-media") {
    return {
      channel: "social",
      platform: utmSource,
      source: utmSource,
      medium,
    };
  }

  if (medium === "ai") {
    return {
      channel: "ai",
      platform: utmSource,
      source: utmSource,
      medium,
    };
  }

  if (["organic", "search"].includes(medium)) {
    return {
      channel: "search",
      platform: utmSource,
      source: utmSource,
      medium,
    };
  }

  if (
    ["chatgpt", "openai", "perplexity", "gemini", "claude", "copilot"].includes(
      utmSource,
    )
  ) {
    return {
      channel: "ai",
      platform: utmSource,
      source: utmSource,
      medium: medium === "referral" ? "ai" : medium,
    };
  }

  return {
    channel: "referral",
    platform: utmSource,
    source: utmSource,
    medium,
  };
}

function classifyFromReferrer(referrer: string | undefined): TrafficClassification | null {
  const host = parseReferrerHost(referrer);

  if (!host) {
    return null;
  }

  const matched = matchHostRule(host);

  if (matched) {
    return {
      channel: matched.channel,
      platform: matched.platform,
      source: matched.platform,
      medium: matched.medium ?? matched.channel,
    };
  }

  return {
    channel: "referral",
    platform: host,
    source: host,
    medium: "referral",
  };
}

export function classifyTraffic(input: ClassifyTrafficInput): TrafficClassification {
  if (input.gclid) {
    return {
      channel: "paid",
      platform: "google",
      source: "google",
      medium: "cpc",
    };
  }

  if (input.fbclid) {
    return {
      channel: "paid",
      platform: "facebook",
      source: "facebook",
      medium: "paid_social",
    };
  }

  if (input.ttclid) {
    return {
      channel: "paid",
      platform: "tiktok",
      source: "tiktok",
      medium: "paid_social",
    };
  }

  const utmSource = normalizeUtmValue(input.utmSource);
  const utmMedium = normalizeUtmValue(input.utmMedium);

  const fromUtm = classifyFromUtm(utmSource, utmMedium);
  if (fromUtm) {
    return fromUtm;
  }

  const fromReferrer = classifyFromReferrer(input.referrer);
  if (fromReferrer) {
    return fromReferrer;
  }

  return {
    channel: "direct",
    platform: "direct",
    source: "direct",
    medium: "none",
  };
}

export function toTrafficAnalyticsParams(
  classification: TrafficClassification,
): Record<string, string> {
  return {
    traffic_channel: classification.channel,
    traffic_platform: classification.platform,
    traffic_source: classification.source ?? classification.platform,
    traffic_medium: classification.medium ?? classification.channel,
  };
}
