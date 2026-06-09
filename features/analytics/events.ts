export const ANALYTICS_EVENTS = [
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
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type SafeAnalyticsValue = string | number | boolean;

export type AnalyticsEventPayloadMap = {
  view_service: {
    service_slug: string;
    service_id?: string;
  };
  click_whatsapp: {
    placement: string;
  };
  start_application: {
    service_slug: string;
    service_id?: string;
    step?: number;
  };
  complete_step: {
    service_slug: string;
    step: number;
  };
  upload_document: {
    doc_type: string;
    mime_type: string;
    file_size_kb: number;
  };
  submit_application: {
    service_slug: string;
    application_id?: string;
  };
  invoice_viewed: {
    application_id: string;
    invoice_id: string;
  };
  payment_uploaded: {
    application_id: string;
    payment_id: string;
  };
  application_completed: {
    application_id: string;
    service_slug?: string;
  };
  click_social_link: {
    platform: string;
  };
};

export type AnalyticsEventPayload<T extends AnalyticsEventName> =
  AnalyticsEventPayloadMap[T];

export const FORBIDDEN_ANALYTICS_KEYS = new Set([
  "email",
  "phone",
  "cnic",
  "address",
  "full_name",
  "fullname",
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
]);
