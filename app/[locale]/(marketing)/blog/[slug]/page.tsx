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
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { redirect } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { requireBlogEnabled } from "@/features/settings/lib/feature-gates";
import { blogPostRepository, redirectRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const post = await blogPostRepository.findPublishedBySlug(slug);

  if (!post) {
    return {};
  }

  return await resolveMetadataFromSeo({
    locale,
    path: `/blog/${post.slug}`,
    seo: post.seoMeta,
    fallbacks: {
      title: {
        en: `${post.titleEn} | PakExcise.com`,
        ur: `${post.titleUr} | PakExcise.com`,
      },
      description: {
        en: post.excerptEn ?? post.contentEn.slice(0, 160),
        ur: post.excerptUr ?? post.contentUr.slice(0, 160),
      },
      h1: {
        en: post.titleEn,
        ur: post.titleUr,
      },
    },
  });
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  await requireBlogEnabled();
  const { slug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const slugRedirect = await redirectRepository.findActiveByOldSlug(`blog:${slug}`);
  if (slugRedirect) {
    const newSlug = slugRedirect.newSlug.replace(/^blog:/, "");
    redirect({ href: `/blog/${newSlug}`, locale });
  }

  const post = await blogPostRepository.findPublishedBySlug(slug);
  if (!post) {
    notFound();
  }

  const t = await getTranslations("marketing.blog");
  const [relatedServices, attachedFaqs] = await Promise.all([
    loadRelatedServices(post.relatedServiceIds),
    loadAttachedFaqs(post.attachedFaqIds),
  ]);

  const title = pickLocalized(locale, {
    en: post.titleEn,
    ur: post.titleUr,
  });
  const excerpt = pickLocalized(locale, {
    en: post.excerptEn,
    ur: post.excerptUr,
  });
  const content = pickLocalized(locale, {
    en: post.contentEn,
    ur: post.contentUr,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: title, url: absoluteUrl(`/blog/${post.slug}`) },
  ]);

  const faqItems = mapFaqsForLocale(attachedFaqs, locale);
  const faqJsonLd = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null;

  return (
    <>
      <JsonLd data={faqJsonLd ? [breadcrumbJsonLd, faqJsonLd] : breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: title },
        ]}
      />
      <article className="container-site py-10 md:py-12">
        {post.publishedAt ? (
          <p className="mb-6 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt, locale)}
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
