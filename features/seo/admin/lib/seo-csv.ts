import type { AdminSeoListItem } from "@/server/repositories/admin-seo-repository";
import { resolveSeoLinkedEntity } from "@/features/seo/admin/lib/seo-linked-entity";

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
  "pageKey",
  "metaTitle",
  "metaDescription",
  "h1",
  "focusKeywords",
  "canonicalUrl",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "twitterCard",
  "robotsIndex",
  "robotsFollow",
  "linkedEntity",
  "updatedAt",
] as const;

export function buildSeoCsv(rows: AdminSeoListItem[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const row of rows) {
    const linked = resolveSeoLinkedEntity(row);
    const keywords =
      row.focusKeywords?.trim() || row.blogPost?.focusKeywords?.trim() || "";

    lines.push(
      [
        cell(row.pageKey),
        cell(row.metaTitleEn),
        cell(row.metaDescriptionEn),
        cell(row.h1En),
        cell(keywords),
        cell(row.canonicalUrl),
        cell(row.ogTitleEn),
        cell(row.ogDescriptionEn),
        cell(row.ogImage),
        cell(row.twitterCard),
        cell(row.robotsIndex),
        cell(row.robotsFollow),
        cell(linked.label),
        cell(row.updatedAt.toISOString()),
      ].join(","),
    );
  }

  return `${lines.join("\n")}\n`;
}
