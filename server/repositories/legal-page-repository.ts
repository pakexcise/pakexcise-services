import "server-only";

import type { Prisma } from "@prisma/client";

import { DEFAULT_LEGAL_PAGE_DEFINITIONS } from "@/features/legal-pages/lib/constants";
import { Repository } from "@/server/repositories/base/repository";
import type { PageContent } from "@/server/repositories/page-content-repository";

export const publicLegalPageSelect = {
  id: true,
  slug: true,
  titleEn: true,
  excerptEn: true,
  contentEn: true,
  isPublished: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  seoMeta: true} as const satisfies Prisma.LegalPageSelect;

export const footerLegalPageSelect = {
  slug: true,
  titleEn: true,
  displayOrder: true} as const satisfies Prisma.LegalPageSelect;

export type PublicLegalPage = Prisma.LegalPageGetPayload<{
  select: typeof publicLegalPageSelect;
}>;

export type FooterLegalPageLink = Prisma.LegalPageGetPayload<{
  select: typeof footerLegalPageSelect;
}>;

export type ResolvedLegalPageContent = {
  slug: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  isPublished: boolean;
  updatedAt: Date | null;
  seo: PublicLegalPage["seoMeta"];
};

export class LegalPageRepository extends Repository {
  async findBySlug(slug: string): Promise<PublicLegalPage | null> {
    return this.query(async () => {
      return this.db.legalPage.findUnique({
        where: { slug },
        select: publicLegalPageSelect});
    }, null);
  }

  async listFooterLinks(): Promise<FooterLegalPageLink[]> {
    return this.query(async () => {
      return this.db.legalPage.findMany({
        where: { isActive: true, isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { titleEn: "asc" }],
        select: footerLegalPageSelect});
    }, []);
  }

  async listPublishedSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.query(async () => {
      return this.db.legalPage.findMany({
        where: { isActive: true, isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { displayOrder: "asc" }});
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
    typeof record.contentEn !== "string"
  ) {
    return null;
  }

  return {
    titleEn: record.titleEn,
    contentEn: record.contentEn,
    excerptEn: record.excerptEn};
}

export async function resolveLegalPageContent(
  slug: string): Promise<ResolvedLegalPageContent | null> {
  const page = await legalPageRepository.findBySlug(slug);

  if (page) {
    return {
      slug: page.slug,
      titleEn: page.titleEn,
      excerptEn: page.excerptEn ?? "",
      contentEn: page.contentEn,
      isPublished: page.isPublished,
      updatedAt: page.updatedAt,
      seo: page.seoMeta};
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
      select: { value: true }});
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
    excerptEn: legacyContent.excerptEn ?? "",
    contentEn: legacyContent.contentEn,
    isPublished: true,
    updatedAt: null,
    seo};
}

export async function getFooterLegalPages(): Promise<FooterLegalPageLink[]> {
  const links = await legalPageRepository.listFooterLinks();
  if (links.length > 0) {
    return links;
  }

  return DEFAULT_LEGAL_PAGE_DEFINITIONS.map((page) => ({
    slug: page.slug,
    titleEn: page.titleEn,
    displayOrder: page.displayOrder}));
}
