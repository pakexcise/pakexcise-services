/**
 * Paths that should count toward public product analytics (page views, traffic).
 * Admin/customer/agent/API/auth shells are excluded so they do not pollute dashboards.
 */
const INTERNAL_PATH_PREFIXES = [
  "/admin",
  "/customer",
  "/agent",
  "/support",
  "/api",
  "/login",
  "/signup",
  "/reset-password",
  "/verify-email",
  "/forgot-password",
] as const;

export function normalizeAnalyticsPath(path: string | null | undefined): string {
  if (!path) {
    return "/";
  }

  const withoutQuery = path.split("?")[0] ?? "/";
  const trimmed = withoutQuery.trim() || "/";

  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }

  return trimmed;
}

export function isPublicAnalyticsPath(path: string | null | undefined): boolean {
  const normalized = normalizeAnalyticsPath(path).toLowerCase();

  return !INTERNAL_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|quora|pinterest|redditbot|whatsapp|telegram|preview|headless|lighthouse|pingdom|gtmetrix|semrush|ahrefs|bytespider|gptbot|claudebot|anthropic|bingpreview|yandex|duckduckbot|baiduspider|sogou|exabot|facebot|ia_archiver/i;

export function isLikelyBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent?.trim()) {
    return false;
  }

  return BOT_UA_PATTERN.test(userAgent);
}
