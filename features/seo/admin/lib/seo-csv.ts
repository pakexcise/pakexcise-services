import "server-only";

import type { AdminSeoListItem } from "@/server/repositories/admin-seo-repository";
import { publicPathFromSeoPageKey } from "@/features/seo/admin/lib/seo-page-paths";
import { resolveSeoLinkedEntity } from "@/features/seo/admin/lib/seo-linked-entity";
import { parseServiceRegionPageKey } from "@/features/services/lib/service-region-pages";
import {
  SEO_CSV_HEADERS,
  formatRobotsCsv,
  parseRobotsCsv,
  seoCsvFilename,
  type SeoCsvCategory,
  type SeoCsvHeader,
  type SeoCsvPreviewStats,
  type SeoCsvRow,
  type SeoCsvRowPreview,
  type SeoCsvRowStatus,
} from "@/features/seo/admin/lib/seo-csv-shared";

export {
  SEO_CSV_HEADERS,
  formatRobotsCsv,
  parseRobotsCsv,
  seoCsvFilename,
};
export type {
  SeoCsvCategory,
  SeoCsvHeader,
  SeoCsvPreviewStats,
  SeoCsvRow,
  SeoCsvRowPreview,
  SeoCsvRowStatus,
};

export function classifySeoCategory(
  row: Pick<
    AdminSeoListItem,
    "serviceId" | "regionId" | "cityId" | "blogPostId" | "legalPageId" | "pageKey"
  >,
): Exclude<SeoCsvCategory, "all"> {
  if (row.serviceId) return "services";
  if (row.pageKey.startsWith("service:") && row.pageKey.split(":").length === 3) {
    return "services";
  }
  if (row.cityId) return "cities";
  if (row.regionId) return "regions";
  if (row.blogPostId) return "blog";
  if (row.legalPageId) return "legal";
  return "static";
}

export function filterSeoRowsByCategory(
  rows: AdminSeoListItem[],
  category: SeoCsvCategory,
): AdminSeoListItem[] {
  if (category === "all") return rows;
  return rows.filter((row) => classifySeoCategory(row) === category);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cell(value: string | null | undefined): string {
  return csvEscape(value?.trim() ?? "");
}

export function resolveSeoCsvIdentity(row: AdminSeoListItem): {
  name: string;
  slug: string;
  path: string;
} {
  const linked = resolveSeoLinkedEntity(row);
  const path =
    publicPathFromSeoPageKey(row.pageKey) ??
    (row.pageKey.startsWith("/") ? row.pageKey : `/${row.pageKey}`);

  const serviceRegion = parseServiceRegionPageKey(row.pageKey);
  if (serviceRegion) {
    return {
      name: `${serviceRegion.serviceSlug} (${serviceRegion.regionSlug})`,
      slug: `${serviceRegion.serviceSlug}/${serviceRegion.regionSlug}`,
      path,
    };
  }

  if (row.service) {
    return {
      name: row.service.nameEn,
      slug: row.service.slug,
      path: `/services/${row.service.slug}`,
    };
  }
  if (row.city) {
    const regionSlug = row.city.region?.slug ?? "";
    return {
      name: row.city.nameEn,
      slug: row.city.slug,
      path: regionSlug ? `/regions/${regionSlug}/${row.city.slug}` : path,
    };
  }
  if (row.region) {
    return {
      name: row.region.nameEn,
      slug: row.region.slug,
      path: `/regions/${row.region.slug}`,
    };
  }
  if (row.blogPost) {
    return {
      name: row.blogPost.titleEn,
      slug: row.blogPost.slug,
      path: `/blog/${row.blogPost.slug}`,
    };
  }
  if (row.legalPage) {
    return {
      name: row.legalPage.titleEn,
      slug: row.legalPage.slug,
      path:
        publicPathFromSeoPageKey(`legal:${row.legalPage.slug}`) ??
        `/${row.legalPage.slug}`,
    };
  }

  const staticSlug = row.pageKey.startsWith("page:")
    ? row.pageKey.slice("page:".length)
    : row.pageKey.includes(":")
      ? row.pageKey
      : row.pageKey;

  return {
    name:
      linked.label === "static"
        ? staticSlug.replace(/-/g, " ")
        : linked.label,
    slug: staticSlug,
    path,
  };
}

export function buildSeoCsv(rows: AdminSeoListItem[]): string {
  const lines = [SEO_CSV_HEADERS.join(",")];

  for (const row of rows) {
    const identity = resolveSeoCsvIdentity(row);
    const keywords =
      row.focusKeywords?.trim() || row.blogPost?.focusKeywords?.trim() || "";

    lines.push(
      [
        cell(row.id),
        cell(row.updatedAt.toISOString()),
        cell(identity.name),
        cell(identity.slug),
        cell(identity.path),
        cell(row.h1En),
        cell(row.metaTitleEn),
        cell(row.metaDescriptionEn),
        cell(keywords),
        cell(row.ogTitleEn),
        cell(row.ogDescriptionEn),
        cell(row.canonicalUrl),
        cell(formatRobotsCsv(row.robotsIndex, row.robotsFollow)),
      ].join(","),
    );
  }

  return `${lines.join("\n")}\n`;
}

/** Minimal RFC4180-ish CSV parser (handles quoted commas/newlines). */
export function parseCsvMatrix(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cellValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cellValue += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cellValue += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cellValue);
      cellValue = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cellValue);
      rows.push(row);
      row = [];
      cellValue = "";
      continue;
    }
    if (ch === "\r") {
      continue;
    }
    cellValue += ch;
  }

  if (cellValue.length > 0 || row.length > 0) {
    row.push(cellValue);
    rows.push(row);
  }

  return rows.filter((r) => r.some((value) => value.trim().length > 0));
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

const HEADER_ALIASES: Record<string, SeoCsvHeader> = {
  id: "id",
  updated_at: "updated_at",
  updatedat: "updated_at",
  name: "name",
  slug: "slug",
  path: "path",
  h1: "h1",
  meta_title: "meta_title",
  metatitle: "meta_title",
  meta_description: "meta_description",
  metadescription: "meta_description",
  focused_keywords: "focused_keywords",
  focus_keywords: "focused_keywords",
  focuskeywords: "focused_keywords",
  og_title: "og_title",
  ogtitle: "og_title",
  og_description: "og_description",
  ogdescription: "og_description",
  canonical_url: "canonical_url",
  canonicalurl: "canonical_url",
  robots: "robots",
};

export function parseSeoCsvRows(text: string): SeoCsvRow[] {
  const matrix = parseCsvMatrix(text.replace(/^\uFEFF/, ""));
  if (matrix.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = matrix[0]!.map((header) => {
    const normalized = normalizeHeader(header);
    return HEADER_ALIASES[normalized] ?? null;
  });

  if (!headers.includes("id")) {
    throw new Error("CSV missing required column: id");
  }

  const required: SeoCsvHeader[] = [
    "name",
    "slug",
    "path",
    "h1",
    "meta_title",
    "meta_description",
    "focused_keywords",
    "og_title",
    "og_description",
    "canonical_url",
    "robots",
  ];

  for (const key of required) {
    if (!headers.includes(key)) {
      throw new Error(`CSV missing required column: ${key}`);
    }
  }

  return matrix.slice(1).map((cols) => {
    const row = {} as SeoCsvRow;
    for (const header of SEO_CSV_HEADERS) {
      const index = headers.indexOf(header);
      row[header] = index >= 0 ? (cols[index] ?? "").trim() : "";
    }
    return row;
  });
}
