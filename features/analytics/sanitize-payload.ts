import {
  FORBIDDEN_ANALYTICS_KEYS,
  type SafeAnalyticsValue,
} from "@/features/analytics/events";

function normalizeKey(key: string): string {
  return key.replace(/-/g, "_").toLowerCase();
}

export function sanitizeAnalyticsPayload(
  payload: Record<string, unknown>,
): Record<string, SafeAnalyticsValue> {
  const safe: Record<string, SafeAnalyticsValue> = {};

  for (const [rawKey, value] of Object.entries(payload)) {
    const key = normalizeKey(rawKey);

    if (FORBIDDEN_ANALYTICS_KEYS.has(key)) {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safe[key] = value;
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }
  }

  return safe;
}

export function normalizeAnalyticsKey(key: string): string {
  return normalizeKey(key);
}
