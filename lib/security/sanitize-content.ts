const UNSAFE_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b/gi,
  /<object\b/gi,
  /<embed\b/gi,
];

export function stripUnsafeMarkup(text: string): string {
  let sanitized = text == null ? "" : String(text);

  for (const pattern of UNSAFE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  return sanitized.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeFaqAnswer(text: string): string {
  return stripUnsafeMarkup(text ?? "");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
