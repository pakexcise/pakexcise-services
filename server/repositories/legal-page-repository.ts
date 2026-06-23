import "server-only";

import type { Prisma } from "@prisma/client";

import { DEFAULT_LEGAL_PAGE_DEFINITIONS } from "@/features/legal-pages/lib/constants";
import { Repository } from "@/server/repositories/base/repository";
import type { PageContent } from "@/server/repositories/page-content-repository";

export const publicLegalPageSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleUr: true,
  excerptEn: true,
  excerptUr: true,
  contentEn: true,
  contentUr: true,
  isPublished: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  seoMeta: true,
} as const satisfies Prisma.LegalPageSelect;

export const footerLegalPageSelect = {
  slug: true,
  titleEn: true,
  titleUr: true,
  displayOrder: true,
} as const satisfies Prisma.LegalPageSelect;

export type PublicLegalPage = Prisma.LegalPageGetPayload<{
  select: typeof publicLegalPageSelect;
}>;

export type FooterLegalPageLink = Prisma.LegalPageGetPayload<{
  select: typeof footerLegalPageSelect;
}>;

export type ResolvedLegalPageContent = {
  slug: string;
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  contentEn: string;
  contentUr: string;
  isPublished: boolean;
  updatedAt: Date | null;
  seo: PublicLegalPage["seoMeta"];
};

export class LegalPageRepository extends Repository {
  async findBySlug(slug: string): Promise<PublicLegalPage | null> {
    return this.query(async () => {
      return this.db.legalPage.findUnique({
        where: { slug },
        select: publicLegalPageSelect,
      });
    }, null);
  }

  async listFooterLinks(): Promise<FooterLegalPageLink[]> {
    return this.query(async () => {
      return this.db.legalPage.findMany({
        where: { isActive: true, isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { titleEn: "asc" }],
        select: footerLegalPageSelect,
      });
    }, []);
  }

  async listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.query(async () => {
      return this.db.legalPage.findMany({
        where: { isActive: true, isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { displayOrder: "asc" },
      });
    }, []);
  }
}

export const legalPageRepository = new LegalPageRepository();

function legacySettingToContent(value: unknown): PageContent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<PageContent>;
  if (
    typeof record.titleEn !== "string" ||
    typeof record.titleUr !== "string" ||
    typeof record.contentEn !== "string" ||
    typeof record.contentUr !== "string"
  ) {
    return null;
  }

  return {
    titleEn: record.titleEn,
    titleUr: record.titleUr,
    contentEn: record.contentEn,
    contentUr: record.contentUr,
    excerptEn: record.excerptEn,
    excerptUr: record.excerptUr,
  };
}

export async function resolveLegalPageContent(
  slug: string,
): Promise<ResolvedLegalPageContent | null> {
  const page = await legalPageRepository.findBySlug(slug);

  if (page) {
    return {
      slug: page.slug,
      titleEn: page.titleEn,
      titleUr: page.titleUr,
      excerptEn: page.excerptEn ?? "",
      excerptUr: page.excerptUr ?? "",
      contentEn: page.contentEn,
      contentUr: page.contentUr,
      isPublished: page.isPublished,
      updatedAt: page.updatedAt,
      seo: page.seoMeta,
    };
  }

  const { pageContentRepository } = await import(
    "@/server/repositories/page-content-repository"
  );
  const { seoMetaRepository } = await import("@/server/repositories/seo-meta-repository");
  const { prisma } = await import("@/server/db/client");

  const legacyKeys = [slug, `page:${slug}`];
  let legacyContent: PageContent | null = null;

  for (const key of legacyKeys) {
    legacyContent = await pageContentRepository.getByPageKey(key);
    if (legacyContent) break;
  }

  if (!legacyContent) {
    const setting = await prisma.setting.findUnique({
      where: { key: `page:${slug}` },
      select: { value: true },
    });
    legacyContent = legacySettingToContent(setting?.value);
  }

  if (!legacyContent) {
    return null;
  }

  const seo =
    (await seoMetaRepository.findByPageKey(slug)) ??
    (await seoMetaRepository.findByPageKey(`page:${slug}`));

  return {
    slug,
    titleEn: legacyContent.titleEn,
    titleUr: legacyContent.titleUr,
    excerptEn: legacyContent.excerptEn ?? "",
    excerptUr: legacyContent.excerptUr ?? "",
    contentEn: legacyContent.contentEn,
    contentUr: legacyContent.contentUr,
    isPublished: true,
    updatedAt: null,
    seo,
  };
}

export async function getFooterLegalPages(): Promise<FooterLegalPageLink[]> {
  const links = await legalPageRepository.listFooterLinks();
  if (links.length > 0) {
    return links;
  }

  return DEFAULT_LEGAL_PAGE_DEFINITIONS.map((page) => ({
    slug: page.slug,
    titleEn: page.titleEn,
    titleUr: page.titleUr,
    displayOrder: page.displayOrder,
  }));
}
