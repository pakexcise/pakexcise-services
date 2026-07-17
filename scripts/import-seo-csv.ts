/**
 * Import SEO metadata from an optimized CSV export into SeoMeta.
 *
 * Usage:
 *   pnpm db:import-seo
 *   pnpm db:import-seo -- --file=path/to/file.csv
 *
 * Canonical URLs are left empty (null) so public pages auto-generate them
 * from the page path. Other SEO fields are upserted by pageKey.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeoCsvRow = {
  pageKey: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  focusKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  robotsIndex: string;
  robotsFollow: string;
};

function parseArgs(argv: string[]) {
  let file = resolve(
    process.cwd(),
    "scripts/data/pakexcise-seo-optimized.csv",
  );
  let keepCanonical = false;

  for (const arg of argv) {
    if (arg.startsWith("--file=")) {
      file = resolve(process.cwd(), arg.slice("--file=".length));
    } else if (arg === "--keep-canonical") {
      keepCanonical = true;
    }
  }

  return { file, keepCanonical };
}

/** Minimal RFC4180-ish CSV parser (handles quoted commas/newlines). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") {
      continue;
    }
    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((value) => value.trim().length > 0));
}

function toBool(value: string, fallback = true): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeTwitterCard(
  value: string,
): "summary" | "summary_large_image" {
  return value.trim() === "summary" ? "summary" : "summary_large_image";
}

function rowsFromCsv(text: string): SeoCsvRow[] {
  const matrix = parseCsv(text);
  if (matrix.length < 2) return [];

  const headers = matrix[0]!.map((h) => h.trim());
  const index = (name: string) => headers.indexOf(name);

  const required = [
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
  ] as const;

  for (const key of required) {
    if (index(key) < 0) {
      throw new Error(`CSV missing required column: ${key}`);
    }
  }

  return matrix.slice(1).map((cols) => ({
    pageKey: cols[index("pageKey")]?.trim() ?? "",
    metaTitle: cols[index("metaTitle")] ?? "",
    metaDescription: cols[index("metaDescription")] ?? "",
    h1: cols[index("h1")] ?? "",
    focusKeywords: cols[index("focusKeywords")] ?? "",
    canonicalUrl: cols[index("canonicalUrl")] ?? "",
    ogTitle: cols[index("ogTitle")] ?? "",
    ogDescription: cols[index("ogDescription")] ?? "",
    ogImage: cols[index("ogImage")] ?? "",
    twitterCard: cols[index("twitterCard")] ?? "",
    robotsIndex: cols[index("robotsIndex")] ?? "",
    robotsFollow: cols[index("robotsFollow")] ?? "",
  }));
}

async function main() {
  const { file, keepCanonical } = parseArgs(process.argv.slice(2));
  const text = readFileSync(file, "utf8");
  const rows = rowsFromCsv(text);

  let updated = 0;
  let created = 0;
  let skipped = 0;
  let blogSynced = 0;

  console.log(`Importing ${rows.length} SEO rows from ${file}`);
  console.log(
    keepCanonical
      ? "Canonical URLs: keeping CSV values"
      : "Canonical URLs: clearing for auto-generate from path",
  );

  for (const row of rows) {
    if (!row.pageKey || row.pageKey.startsWith("guide:")) {
      skipped += 1;
      continue;
    }

    const data = {
      metaTitleEn: emptyToNull(row.metaTitle),
      metaDescriptionEn: emptyToNull(row.metaDescription),
      h1En: emptyToNull(row.h1),
      focusKeywords: emptyToNull(row.focusKeywords),
      canonicalUrl: keepCanonical ? emptyToNull(row.canonicalUrl) : null,
      ogTitleEn: emptyToNull(row.ogTitle),
      ogDescriptionEn: emptyToNull(row.ogDescription),
      ogImage: emptyToNull(row.ogImage),
      twitterCard: normalizeTwitterCard(row.twitterCard),
      robotsIndex: toBool(row.robotsIndex, true),
      robotsFollow: toBool(row.robotsFollow, true),
    };

    const existing = await prisma.seoMeta.findUnique({
      where: { pageKey: row.pageKey },
      select: { id: true, blogPostId: true },
    });

    if (existing) {
      await prisma.seoMeta.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;

      if (existing.blogPostId && data.focusKeywords !== undefined) {
        await prisma.blogPost.update({
          where: { id: existing.blogPostId },
          data: { focusKeywords: data.focusKeywords },
        });
        blogSynced += 1;
      }
    } else {
      await prisma.seoMeta.create({
        data: {
          pageKey: row.pageKey,
          ...data,
        },
      });
      created += 1;
    }
  }

  console.log(
    JSON.stringify(
      { updated, created, skipped, blogSynced, total: rows.length },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
