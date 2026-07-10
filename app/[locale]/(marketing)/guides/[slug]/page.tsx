import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ContentDetailExtras } from "@/components/marketing/content-detail-extras";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import {
  loadAttachedFaqs,
  loadRelatedServices,
} from "@/features/cms/lib/load-content-extras";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { getBrandingSettings, getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { resolveDefaultOgImagePath } from "@/features/settings/lib/branding-resolvers";
import { resolveSeoImageUrl } from "@/lib/seo-url";
import { redirect } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { requireGuidesEnabled } from "@/features/settings/lib/feature-gates";
import { guideRepository, redirectRepository } from "@/server/repositories";
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

  return await resolveMetadataFromSeo({
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
  await requireGuidesEnabled();
  const { slug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const guide = await guideRepository.findPublishedBySlug(slug);
  if (!guide) {
    const slugRedirect = await redirectRepository.findActiveByOldSlug(`guide:${slug}`);
    if (slugRedirect) {
      const newSlug = slugRedirect.newSlug.replace(/^guide:/, "");
      redirect({ href: `/guides/${newSlug}`, locale });
    }

    notFound();
  }

  const t = await getTranslations("marketing.guides");
  const [relatedServices, attachedFaqs, branding, business] = await Promise.all([
    loadRelatedServices(guide.relatedServiceIds),
    loadAttachedFaqs(guide.attachedFaqIds),
    getBrandingSettings(),
    getBusinessSettings(),
  ]);

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

  const faqItems = mapFaqsForLocale(attachedFaqs, locale);
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const pageUrl = absoluteUrl(`/guides/${guide.slug}`);
  const articleJsonLd = buildArticleJsonLd({
    type: "Article",
    headline: title,
    description: excerpt ?? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    url: pageUrl,
    datePublished: guide.publishedAt?.toISOString(),
    dateModified: guide.updatedAt.toISOString(),
    imageUrl:
      resolveSeoImageUrl(guide.seoMeta?.ogImage) ??
      resolveSeoImageUrl(resolveDefaultOgImagePath(branding, locale)),
    publisherName: business.siteName,
    publisherLogoUrl: resolveSeoImageUrl(branding.logoPath),
    inLanguage: locale === "ur" ? "ur-PK" : "en-PK",
  });
  const jsonLd = [breadcrumbJsonLd, articleJsonLd, faqJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
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
      <ContentDetailExtras
        locale={locale}
        relatedServices={relatedServices}
        attachedFaqs={attachedFaqs}
        labels={{
          relatedServices: t("relatedServices"),
          faqs: t("attachedFaqs"),
        }}
      />
    </>
  );
}
