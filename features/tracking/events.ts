export const ACTIVITY_EVENTS = [
  "page_view",
  "service_view",
  "whatsapp_click",
  "contact_form_submit",
  "signup_started",
  "signup_completed",
  "login_success",
  "login_failed",
  "otp_requested",
  "otp_verified",
  "application_started",
  "application_submitted",
  "document_uploaded",
  "payment_started",
  "payment_completed",
  "application_status_changed",
  "admin_login",
  "admin_action",
] as const;

export type ActivityEventName = (typeof ACTIVITY_EVENTS)[number];

/** Events that may be recorded from the browser via the public server action. */
export const CLIENT_ACTIVITY_EVENTS = [
  "page_view",
  "service_view",
  "whatsapp_click",
  "signup_started",
  "signup_completed",
  "login_success",
  "login_failed",
  "application_started",
  "payment_started",
  "otp_verified",
] as const satisfies readonly ActivityEventName[];

export type ClientActivityEventName = (typeof CLIENT_ACTIVITY_EVENTS)[number];

export const FORBIDDEN_ACTIVITY_METADATA_KEYS = new Set([
  "email",
  "phone",
  "cnic",
  "address",
  "full_name",
  "fullname",
  "name",
  "password",
  "otp",
  "token",
  "secret",
  "file_name",
  "filename",
  "document_name",
  "r2_key",
  "r2key",
  "object_key",
  "note",
  "notes",
  "admin_notes",
  "private_notes",
  "tracking_id",
  "invoice_number",
  "checksum",
  "card",
  "payment_card",
]);
