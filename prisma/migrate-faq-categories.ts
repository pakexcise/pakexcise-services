/**
 * Migrates legacy FAQ `category` string column to FaqCategory records + categoryId FK.
 * Run before `pnpm db:push` when upgrading from the old FAQ schema:
 *   pnpm db:migrate-faq-categories && pnpm db:push
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  {
    slug: "general",
    nameEn: "General",
    displayOrder: 1},
  {
    slug: "support",
    nameEn: "Support",
    displayOrder: 2},
  {
    slug: "account",
    nameEn: "Account",
    displayOrder: 3},
  {
    slug: "billing",
    nameEn: "Billing & fees",
    displayOrder: 4},
  {
    slug: "regions",
    nameEn: "Regions",
    displayOrder: 5},
  {
    slug: "documents",
    nameEn: "Documents",
    displayOrder: 6}] as const;

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function hasLegacyCategoryColumn() {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'faqs'
        AND column_name = 'category'
    ) AS "exists"
  `;

  return rows[0]?.exists ?? false;
}

async function hasCategoryIdColumn() {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'faqs'
        AND column_name = 'categoryId'
    ) AS "exists"
  `;

  return rows[0]?.exists ?? false;
}

async function ensureDefaultCategories() {
  for (const category of defaultCategories) {
    await prisma.faqCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: {}});
  }
}

async function migrateLegacyCategories() {
  const legacyRows = await prisma.$queryRaw<{ category: string }[]>`
    SELECT DISTINCT category FROM faqs WHERE category IS NOT NULL
  `;

  for (const row of legacyRows) {
    const slug = row.category.trim().toLowerCase();

    if (!slug) {
      continue;
    }

    await prisma.faqCategory.upsert({
      where: { slug },
      create: {
        slug,
        nameEn: titleCaseSlug(slug),
        displayOrder: 99},
      update: {}});
  }
}

async function backfillCategoryIds() {
  const faqs = await prisma.$queryRaw<{ id: string; category: string }[]>`
    SELECT id, category FROM faqs WHERE "categoryId" IS NULL
  `;

  for (const faq of faqs) {
    const slug = faq.category?.trim().toLowerCase() || "general";
    const category = await prisma.faqCategory.findUnique({
      where: { slug },
      select: { id: true }});

    if (!category) {
      throw new Error(`Missing FAQ category for slug "${slug}"`);
    }

    await prisma.$executeRaw`
      UPDATE faqs SET "categoryId" = ${category.id} WHERE id = ${faq.id}
    `;
  }
}

async function main() {
  const faqCategoryTable = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'faq_categories'
    ) AS "exists"
  `;

  if (!faqCategoryTable[0]?.exists) {
    console.log("Creating faq_categories table...");
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS faq_categories (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        "nameEn" TEXT NOT NULL,
        "descriptionEn" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS faq_categories_isActive_displayOrder_idx
      ON faq_categories ("isActive", "displayOrder")
    `;
  }

  await ensureDefaultCategories();

  const legacyColumn = await hasLegacyCategoryColumn();
  const categoryIdColumn = await hasCategoryIdColumn();

  if (!categoryIdColumn) {
    console.log("Adding categoryId column to faqs...");
    await prisma.$executeRaw`
      ALTER TABLE faqs ADD COLUMN IF NOT EXISTS "categoryId" TEXT
    `;
  }

  if (legacyColumn) {
    console.log("Migrating legacy category strings...");
    await migrateLegacyCategories();
    await backfillCategoryIds();
  }

  const general = await prisma.faqCategory.findUnique({
    where: { slug: "general" },
    select: { id: true }});

  if (general) {
    await prisma.$executeRaw`
      UPDATE faqs SET "categoryId" = ${general.id} WHERE "categoryId" IS NULL
    `;
  }

  console.log("FAQ category migration complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
