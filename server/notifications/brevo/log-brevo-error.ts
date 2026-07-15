import "server-only";

type BrevoErrorShape = {
  code?: string;
  message?: string;
};

const FALLBACK_KEYWORDS = [
  "credit",
  "quota",
  "limit",
  "rate",
  "too many",
  "unavailable",
  "timeout",
  "temporarily",
  "maintenance",
  "overloaded",
];

function includesFallbackKeyword(value: string): boolean {
  const normalized = value.toLowerCase();
  return FALLBACK_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function summarizeBrevoError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 180) || "brevo_delivery_failed";
  }

  return "brevo_delivery_failed";
}

export function isBrevoFallbackEligibleError(
  error: unknown,
  httpStatus?: number,
): boolean {
  if (httpStatus !== undefined) {
    if (httpStatus === 429 || httpStatus === 402) {
      return true;
    }

    if (httpStatus >= 500) {
      return true;
    }

    if (httpStatus === 401 || httpStatus === 403) {
      return true;
    }

    if (httpStatus === 408) {
      return true;
    }
  }

  if (!(error instanceof Error)) {
    return true;
  }

  const message = error.message.toLowerCase();

  if (
    error.name === "AbortError" ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timed out") ||
    message.includes("timeout")
  ) {
    return true;
  }

  if (includesFallbackKeyword(message)) {
    return true;
  }

  const shaped = error as Error & BrevoErrorShape;
  const code = shaped.code?.toLowerCase() ?? "";

  if (
    code.includes("credit") ||
    code.includes("quota") ||
    code.includes("limit") ||
    code.includes("rate")
  ) {
    return true;
  }

  return false;
}

export function logBrevoDeliveryFailure(
  error: unknown,
  httpStatus?: number,
): void {
  console.error("[email:brevo] delivery failed", {
    httpStatus,
    reason: summarizeBrevoError(error),
    fallbackEligible: isBrevoFallbackEligibleError(error, httpStatus),
  });
}
