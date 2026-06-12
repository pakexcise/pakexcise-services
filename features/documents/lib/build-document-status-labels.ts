import type { DocumentStatus } from "@prisma/client";

const DOCUMENT_STATUS_KEYS: DocumentStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "MISSING",
];

export function buildDocumentStatusLabels(
  translate: (key: string) => string,
): Record<string, string> {
  const labels: Record<string, string> = {};

  for (const status of DOCUMENT_STATUS_KEYS) {
    labels[status] = translate(status);
  }

  return labels;
}
