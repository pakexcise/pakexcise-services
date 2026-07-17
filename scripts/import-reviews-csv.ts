/**
 * Wipe all reviews and import from scripts/data/pakexcise-reviews-final.csv.
 *
 * - Deletes every existing review first
 * - Imports CSV rows as MANUAL + isDummy=true
 * - Publishes only the first 5 (--publish=N to change)
 * - Remaining rows stay PENDING / unpublished for admin approval
 *
 * Usage:
 *   pnpm db:import-reviews
 *   pnpm db:import-reviews -- --publish=5
 *   pnpm db:import-reviews -- --file=path/to/file.csv
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ReviewCsvRow = {
  reviewId: string;
  serviceKey: string;
  serviceName: string;
  reviewerName: string;
  gender: string;
  reviewerType: string;
  location: string;
  country: string;
  reviewLanguage: string;
  rating: string;
  reviewContent: string;
};

function parseArgs(argv: string[]) {
  let file = resolve(process.cwd(), "scripts/data/pakexcise-reviews-final.csv");
  let publishCount = 5;

  for (const arg of argv) {
    if (arg.startsWith("--file=")) {
      file = resolve(process.cwd(), arg.slice("--file=".length));
    } else if (arg.startsWith("--publish=")) {
      publishCount = Math.max(0, Number(arg.slice("--publish=".length)) || 0);
    }
  }

  return { file, publishCount };
}

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
    if (ch === "\r") continue;
    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((value) => value.trim().length > 0));
}

function rowsFromCsv(text: string): ReviewCsvRow[] {
  const matrix = parseCsv(text);
  if (matrix.length < 2) return [];
  const headers = matrix[0]!.map((h) => h.trim());
  const index = (name: string) => headers.indexOf(name);

  const required = [
    "review_id",
    "service_key",
    "service_name",
    "reviewer_name",
    "gender",
    "reviewer_type",
    "location",
    "country",
    "review_language",
    "rating",
    "review_content",
  ] as const;

  for (const key of required) {
    if (index(key) < 0) throw new Error(`CSV missing required column: ${key}`);
  }

  return matrix.slice(1).map((cols) => ({
    reviewId: cols[index("review_id")]?.trim() ?? "",
    serviceKey: cols[index("service_key")]?.trim() ?? "",
    serviceName: cols[index("service_name")]?.trim() ?? "",
    reviewerName: cols[index("reviewer_name")]?.trim() ?? "",
    gender: cols[index("gender")]?.trim() ?? "",
    reviewerType: cols[index("reviewer_type")]?.trim() ?? "",
    location: cols[index("location")]?.trim() ?? "",
    country: cols[index("country")]?.trim() ?? "",
    reviewLanguage: cols[index("review_language")]?.trim() ?? "",
    rating: cols[index("rating")]?.trim() ?? "5",
    reviewContent: cols[index("review_content")]?.trim() ?? "",
  }));
}

function serviceSlugFromKey(serviceKey: string): string {
  return serviceKey.replace(/^service:/, "").trim();
}

function buildAuthorRole(row: ReviewCsvRow): string {
  const typeLabel =
    row.reviewerType === "overseas-pakistani"
      ? "Overseas Pakistani"
      : row.reviewerType === "local"
        ? "Local customer"
        : row.reviewerType || "Customer";

  const place = row.location || row.country;
  if (place) return `${typeLabel} · ${place}`;
  return typeLabel;
}

function clampRating(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value * 10) / 10));
}

function publishedAtForIndex(index: number, now: Date): Date {
  // Stagger published dates so relative labels look natural (2d, 5d, 1w, …).
  const dayOffsets = [2, 5, 8, 14, 21];
  const days = dayOffsets[index] ?? 2 + index * 3;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  const { file, publishCount } = parseArgs(process.argv.slice(2));
  const rows = rowsFromCsv(readFileSync(file, "utf8")).filter(
    (row) => row.reviewId && row.reviewerName && row.reviewContent.length >= 10,
  );

  console.log(`Loading services…`);
  const services = await prisma.service.findMany({
    select: { id: true, slug: true, nameEn: true },
  });
  const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

  const missingSlugs = new Set<string>();
  for (const row of rows) {
    const slug = serviceSlugFromKey(row.serviceKey);
    if (slug && !serviceBySlug.has(slug)) missingSlugs.add(slug);
  }

  if (missingSlugs.size > 0) {
    console.warn(
      `Warning: ${missingSlugs.size} service slug(s) not found (reviews will import without service link):`,
    );
    console.warn([...missingSlugs].sort().join(", "));
  }

  console.log(`Deleting all existing reviews…`);
  const deleted = await prisma.review.deleteMany({});
  console.log(`Deleted ${deleted.count} review(s).`);

  const now = new Date();
  let imported = 0;
  let published = 0;
  let pending = 0;
  let withoutService = 0;

  console.log(
    `Importing ${rows.length} reviews from ${file} (publish first ${publishCount})…`,
  );

  // Create in chunks for Neon reliability
  const chunkSize = 50;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    await prisma.$transaction(
      chunk.map((row, offset) => {
        const index = start + offset;
        const slug = serviceSlugFromKey(row.serviceKey);
        const service = slug ? serviceBySlug.get(slug) : undefined;
        if (!service) withoutService += 1;

        const isPublished = index < publishCount;
        if (isPublished) published += 1;
        else pending += 1;
        imported += 1;

        const moderatedAt = isPublished
          ? publishedAtForIndex(index, now)
          : null;

        return prisma.review.create({
          data: {
            authorNameEn: row.reviewerName.slice(0, 100),
            authorRoleEn: buildAuthorRole(row).slice(0, 120),
            contentEn: row.reviewContent.slice(0, 1200),
            rating: clampRating(row.rating),
            source: "MANUAL",
            status: isPublished ? "APPROVED" : "PENDING",
            isActive: isPublished,
            isDummy: true,
            customerConsent: true,
            displayOrder: index + 1,
            serviceId: service?.id ?? null,
            externalId: `seed:${row.reviewId}`,
            submittedAt: moderatedAt ?? now,
            moderatedAt,
          },
        });
      }),
    );
  }

  console.log(
    JSON.stringify(
      {
        deleted: deleted.count,
        imported,
        published,
        pending,
        withoutService,
        publishCount,
      },
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
