import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { guideRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const guide = await guideRepository.findPublishedBySlug(slug);

  if (!guide) {
    return {};
  }

  return resolveMetadataFromSeo({
    locale,
    path: `/guides/${guide.slug}`,
    seo: guide.seoMeta,
    fallbacks: {
      title: {
        en: `${guide.titleEn} | PakExcise.com`,
        ur: `${guide.titleUr} | PakExcise.com`,
      },
      description: {
        en: guide.excerptEn ?? guide.contentEn.slice(0, 160),
        ur: guide.excerptUr ?? guide.contentUr.slice(0, 160),
      },
      h1: {
        en: guide.titleEn,
        ur: guide.titleUr,
      },
    },
  });
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const guide = await guideRepository.findPublishedBySlug(slug);

  if (!guide) {
    notFound();
  }

  const title = pickLocalized(locale, {
    en: guide.titleEn,
    ur: guide.titleUr,
  });
  const excerpt = pickLocalized(locale, {
    en: guide.excerptEn,
    ur: guide.excerptUr,
  });
  const content = pickLocalized(locale, {
    en: guide.contentEn,
    ur: guide.contentUr,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Guides", url: absoluteUrl("/guides") },
    { name: title, url: absoluteUrl(`/guides/${guide.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: title },
        ]}
      />
      <article className="container-site py-10 md:py-12">
        {guide.publishedAt ? (
          <p className="mb-6 text-sm text-muted-foreground">
            <time dateTime={guide.publishedAt.toISOString()}>
              {formatDate(guide.publishedAt, locale)}
            </time>
          </p>
        ) : null}
        <ProseContent content={content} />
      </article>
    </>
  );
}
