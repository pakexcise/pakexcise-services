import "server-only";

import type { SeoMetaInput } from "@/lib/validations/admin-seo";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";
import { prisma } from "@/server/db/client";

function normalizeSeoInput(seo: SeoMetaInput) {
  return {
    metaTitleEn: seo.metaTitleEn || null,
    metaDescriptionEn: seo.metaDescriptionEn || null,
    h1En: seo.h1En || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitleEn: seo.ogTitleEn || null,
    ogDescriptionEn: seo.ogDescriptionEn || null,
    ogImage: seo.ogImage || null,
    twitterCard: seo.twitterCard ?? "summary_large_image",
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    faqSchemaJson: toPrismaNullableJson(seo.faqSchemaJson),
    breadcrumbJson: toPrismaNullableJson(seo.breadcrumbJson)};
}

export async function upsertBlogSeo(
  blogPostId: string,
  slug: string,
  seo?: SeoMetaInput,
) {
  if (!seo) {
    return;
  }

  const data = normalizeSeoInput(seo);

  await prisma.seoMeta.upsert({
    where: { blogPostId },
    update: data,
    create: {
      pageKey: `blog:${slug}`,
      blogPostId,
      ...data}});
}

export async function upsertLegalPageSeo(
  legalPageId: string,
  slug: string,
  seo?: SeoMetaInput,
) {
  if (!seo) {
    return;
  }

  const data = normalizeSeoInput(seo);

  await prisma.seoMeta.upsert({
    where: { legalPageId },
    update: data,
    create: {
      pageKey: `legal:${slug}`,
      legalPageId,
      ...data}});
}

export async function upsertStaticPageSeo(
  pageKey: string,
  seo?: SeoMetaInput,
) {
  if (!seo) {
    return;
  }

  const data = normalizeSeoInput(seo);

  await prisma.seoMeta.upsert({
    where: { pageKey },
    update: data,
    create: {
      pageKey,
      ...data}});
}

export async function upsertStandaloneSeo(
  id: string,
  pageKey: string,
  seo: SeoMetaInput,
) {
  const data = normalizeSeoInput(seo);

  await prisma.seoMeta.update({
    where: { id },
    data: {
      pageKey,
      ...data}});
}
