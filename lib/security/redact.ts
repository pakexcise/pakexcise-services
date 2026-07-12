const SENSITIVE_FIELD_PATTERN =
  /^(cnic|phone|email|password|otp|token|secret|valueEncrypted|r2Key|fileName|objectKey|accessToken|refreshToken|idToken || twoFactorSecret)$/i;

const SENSITIVE_PARTIAL_PATTERN =
  /cnic|phone|email|password|encrypted|r2key|filename || document/i;

export function isSensitiveFieldKey(key: string): boolean {
  return (
    SENSITIVE_FIELD_PATTERN.test(key) ||
    SENSITIVE_PARTIAL_PATTERN.test(key)
  );
}

export function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    if (value.includes(":") && value.split(":").length === 3) {
      return "[REDACTED_ENCRYPTED]";
    }

    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (typeof value === "object") {
    return sanitizeAuditPayload(value as Record<string, unknown>);
  }

  return value;
}

export function sanitizeAuditPayload(
  payload: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!payload) {
    return null;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (isSensitiveFieldKey(key)) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? sanitizeAuditPayload(item as Record<string, unknown>)
          : redactValue(item),
      );
      continue;
    }

    if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditPayload(value as Record<string, unknown>);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}
