import type { AdminReviewItem } from "@/server/repositories/admin-review-repository";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cell(value: string | null | undefined | boolean | number): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return csvEscape(value?.trim() ?? "");
}

const CSV_HEADERS = [
  "id",
  "authorName",
  "service",
  "serviceSlug",
  "content",
  "rating",
  "status",
  "source",
  "recordType",
  "isPublished",
  "displayOrder",
  "trackingId",
  "submittedAt",
  "moderatedAt",
  "createdAt",
  "updatedAt",
] as const;

export function buildReviewsCsv(rows: AdminReviewItem[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const row of rows) {
    lines.push(
      [
        cell(row.id),
        cell(row.authorNameEn),
        cell(row.service?.nameEn),
        cell(row.service?.slug),
        cell(row.contentEn),
        cell(row.rating),
        cell(row.status),
        cell(row.source),
        cell(row.isDummy ? "dummy" : "real"),
        cell(row.isActive),
        cell(row.displayOrder),
        cell(row.application?.trackingId),
        cell(row.submittedAt.toISOString()),
        cell(row.moderatedAt?.toISOString() ?? ""),
        cell(row.createdAt.toISOString()),
        cell(row.updatedAt.toISOString()),
      ].join(","),
    );
  }

  return `${lines.join("\n")}\n`;
}
