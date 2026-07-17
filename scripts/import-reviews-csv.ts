/**
 * Wipe all reviews, then import from CSV.
 *
 * First 5 rows → APPROVED + published (isActive true).
 * Remaining rows → PENDING + unpublished for later admin approval.
 *
 * Usage:
 *   pnpm db:import-reviews
 *   pnpm db:import-reviews -- --file=path/to/file.csv --publish=5
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
  let file = resolve(process.cwd(), "scripts/data/pakexcise-reviews.csv");
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
    if (index(key) < 0) {
      throw new Error(`CSV missing required column: ${key}`);
    }
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

function serviceSlugFromKey(serviceKey: string): string | null {
  if (!serviceKey) return null;
  if (serviceKey.startsWith("service:")) {
    return serviceKey.slice("service:".length) || null;
  }
  return serviceKey;
}

function buildAuthorRole(row: ReviewCsvRow): string {
  const parts: string[] = [];
  if (row.location) parts.push(row.location);
  else if (row.country) parts.push(row.country);

  if (row.reviewerType === "overseas-pakistani") {
    parts.push("Overseas Pakistani");
  } else if (row.reviewerType === "local") {
    parts.push("Pakistan");
  } else if (row.reviewerType) {
    parts.push(row.reviewerType);
  }

  return parts.filter(Boolean).join(" · ").slice(0, 120);
}

function clampRating(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n * 10) / 10));
}

async function main() {
  const { file, publishCount } = parseArgs(process.argv.slice(2));
  const text = readFileSync(file, "utf8");
  const rows = rowsFromCsv(text).filter(
    (row) => row.reviewId && row.reviewerName && row.reviewContent.length >= 10,
  );

  console.log(`Loaded ${rows.length} reviews from ${file}`);
  console.log(`Publishing first ${publishCount}; rest stay PENDING`);

  const services = await prisma.service.findMany({
    select: { id: true, slug: true, nameEn: true },
  });
  const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

  const deleted = await prisma.review.deleteMany({});
  console.log(`Deleted existing reviews: ${deleted.count}`);

  let created = 0;
  let missingService = 0;
  const batchSize = 25;

  async function createBatch(
    chunk: ReviewCsvRow[],
    offset: number,
    attempt = 1,
  ): Promise<void> {
    try {
      const data = chunk.map((row, chunkIndex) => {
        const index = offset + chunkIndex;
        const slug = serviceSlugFromKey(row.serviceKey);
        const service = slug ? serviceBySlug.get(slug) : undefined;
        if (!service) missingService += 1;

        const publish = index < publishCount;

        return {
          authorNameEn: row.reviewerName.slice(0, 100),
          authorRoleEn: buildAuthorRole(row) || null,
          contentEn: row.reviewContent,
          rating: clampRating(row.rating),
          source: "MANUAL" as const,
          status: (publish ? "APPROVED" : "PENDING") as "APPROVED" | "PENDING",
          isActive: publish,
          displayOrder: index + 1,
          customerConsent: true,
          externalId: `csv:${row.reviewId}`,
          serviceId: service?.id ?? null,
          moderatedAt: publish ? new Date() : null,
          submittedAt: new Date(),
        };
      });

      await prisma.review.createMany({ data });
    } catch (error) {
      if (attempt >= 4) throw error;
      const delayMs = attempt * 1500;
      console.warn(
        `Batch at ${offset} failed (attempt ${attempt}). Retrying in ${delayMs}ms…`,
      );
      await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
      // Recreate client-friendly delay; Prisma may recover on next call
      await createBatch(chunk, offset, attempt + 1);
    }
  }

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const chunk = rows.slice(offset, offset + batchSize);
    await createBatch(chunk, offset);
    created += chunk.length;
    console.log(`Imported ${created}/${rows.length}`);
  }

  console.log(
    JSON.stringify(
      {
        deleted: deleted.count,
        created,
        published: Math.min(publishCount, created),
        pending: Math.max(0, created - publishCount),
        missingService,
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
