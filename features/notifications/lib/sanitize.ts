import "server-only";

const CNIC_PATTERN = /\b\d{5}-\d{7}-\d\b/g;
const R2_URL_PATTERN =
  /https?:\/\/[^\s]*(?:r2\.cloudflarestorage\.com|\.r2\.dev)[^\s]*/gi;

export function sanitizeNotificationText(text: string): string {
  return text
    .replace(CNIC_PATTERN, "[redacted]")
    .replace(R2_URL_PATTERN, "[dashboard link]")
    .trim();
}
