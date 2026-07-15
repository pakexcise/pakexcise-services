import "server-only";

import type { SendEmailInput } from "@/server/notifications/email/types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildHtmlBody(input: SendEmailInput): string {
  if (input.html?.trim()) {
    return input.html;
  }

  const paragraphs = input.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  return paragraphs || `<p>${escapeHtml(input.text)}</p>`;
}
