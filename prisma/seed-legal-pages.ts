import type { PrismaClient } from "@prisma/client";

import {
  DEFAULT_LEGAL_PAGE_DEFINITIONS,
  LEGACY_LEGAL_PAGE_KEY_MAP,
} from "../features/legal-pages/lib/constants";

type LegacyPageContent = {
  titleEn?: string;
  excerptEn?: string;
  contentEn?: string;
};

function readLegacyContent(value: unknown): LegacyPageContent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as LegacyPageContent;
}

async function readLegacySettingContent(
  prisma: PrismaClient,
  keys: string[],
): Promise<LegacyPageContent | null> {
  for (const key of keys) {
    const setting = await prisma.setting.findUnique({
      where: { key: `page:${key}` },
      select: { value: true },
    });

    const content = readLegacyContent(setting?.value);
    if (content?.titleEn && content.contentEn) {
      return content;
    }
  }

  return null;
}

export async function seedLegalPages(prisma: PrismaClient) {
  for (const definition of DEFAULT_LEGAL_PAGE_DEFINITIONS) {
    const legacyKey = Object.entries(LEGACY_LEGAL_PAGE_KEY_MAP).find(
      ([, slug]) => slug === definition.slug,
    )?.[0];

    const legacyContent = await readLegacySettingContent(prisma, [
      definition.slug,
      ...(legacyKey ? [legacyKey] : []),
    ]);

    const page = await prisma.legalPage.upsert({
      where: { slug: definition.slug },
      update: {},
      create: {
        slug: definition.slug,
        titleEn: legacyContent?.titleEn ?? definition.titleEn,
        excerptEn: legacyContent?.excerptEn ?? definition.excerptEn,
        contentEn: legacyContent?.contentEn ?? definition.contentEn,
        isPublished: true,
        isActive: true,
        displayOrder: definition.displayOrder,
        publishedAt: new Date(),
      },
      select: { id: true, slug: true, titleEn: true },
    });

    const existingSeo =
      (await prisma.seoMeta.findUnique({ where: { legalPageId: page.id } })) ??
      (await prisma.seoMeta.findFirst({
        where: {
          OR: [{ pageKey: definition.slug }, { pageKey: `page:${definition.slug}` }],
        },
      }));

    const seoData = {
      metaTitleEn: existingSeo?.metaTitleEn ?? `${page.titleEn} | PakExcise.com`,
      metaDescriptionEn:
        existingSeo?.metaDescriptionEn ??
        legacyContent?.excerptEn ??
        definition.excerptEn,
      h1En: existingSeo?.h1En ?? page.titleEn,
      canonicalUrl: existingSeo?.canonicalUrl ?? `/${definition.slug}`,
      ogTitleEn: existingSeo?.ogTitleEn ?? page.titleEn,
      ogDescriptionEn:
        existingSeo?.ogDescriptionEn ??
        legacyContent?.excerptEn ??
        definition.excerptEn,
      ogImage: existingSeo?.ogImage ?? null,
      twitterCard: existingSeo?.twitterCard ?? "summary_large_image",
      robotsIndex: existingSeo?.robotsIndex ?? true,
      robotsFollow: existingSeo?.robotsFollow ?? true,
    };

    await prisma.seoMeta.upsert({
      where: { legalPageId: page.id },
      update: seoData,
      create: {
        pageKey: `legal:${definition.slug}`,
        legalPageId: page.id,
        ...seoData,
      },
    });
  }
}
