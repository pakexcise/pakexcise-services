import {
  FORBIDDEN_ACTIVITY_METADATA_KEYS,
  type ActivityEventName,
} from "@/features/tracking/events";

export type SafeActivityMetadataValue = string | number | boolean;

function normalizeKey(key: string): string {
  return key.replace(/-/g, "_").toLowerCase();
}

export function sanitizeActivityMetadata(
  payload: Record<string, unknown>,
): Record<string, SafeActivityMetadataValue> {
  const safe: Record<string, SafeActivityMetadataValue> = {};

  for (const [rawKey, value] of Object.entries(payload)) {
    const key = normalizeKey(rawKey);

    if (FORBIDDEN_ACTIVITY_METADATA_KEYS.has(key)) {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      if (typeof value === "string" && value.length > 500) {
        safe[key] = value.slice(0, 500);
      } else {
        safe[key] = value;
      }
    }
  }

  return safe;
}

export function isActivityEventName(value: string): value is ActivityEventName {
  return (
    value === "page_view" ||
    value === "service_view" ||
    value === "whatsapp_click" ||
    value === "contact_form_submit" ||
    value === "signup_started" ||
    value === "signup_completed" ||
    value === "login_success" ||
    value === "login_failed" ||
    value === "otp_requested" ||
    value === "otp_verified" ||
    value === "application_started" ||
    value === "application_submitted" ||
    value === "document_uploaded" ||
    value === "payment_started" ||
    value === "payment_completed" ||
    value === "application_status_changed" ||
    value === "admin_login" ||
    value === "admin_action"
  );
}
