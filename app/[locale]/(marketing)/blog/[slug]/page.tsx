import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { BlogFaqSection } from "@/components/marketing/blog/blog-faq-section";
import { BlogPostTags } from "@/components/marketing/blog/blog-post-tags";
import { BlogFeaturedImage } from "@/components/marketing/blog/blog-featured-image";
import { BlogPostCta } from "@/components/marketing/blog/blog-post-cta";
import { BlogPostMetaBar } from "@/components/marketing/blog/blog-post-meta-bar";
import { BlogRelatedPosts } from "@/components/marketing/blog/blog-related-posts";
import { BlogPostSidebar } from "@/components/marketing/blog/blog-post-sidebar";
import { BlogShareButtons } from "@/components/marketing/blog/blog-share-buttons";
import { BlogTableOfContents } from "@/components/marketing/blog/blog-table-of-contents";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { JsonLd } from "@/components/marketing/json-ld";
import { ProseContent } from "@/components/marketing/prose-content";
import {
  loadAttachedFaqs,
} from "@/features/cms/lib/load-content-extras";
import {
  resolveBlogContentFaqs,
  resolveBlogCtaFields,
} from "@/features/blog/lib/blog-defaults";
import {
  mapBlogContentFaqsForLocale,
  mergeBlogFaqItems,
  parseBlogContentFaqs,
} from "@/features/blog/lib/content-faqs";
import { resolveBlogOgImageUrl } from "@/features/blog/lib/featured-image";
import { extractBlogTableOfContents } from "@/features/blog/lib/toc";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { getBrandingSettings, getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { redirect } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { resolveSeoImageUrl } from "@/lib/seo-url";
import { absoluteUrl } from "@/lib/utils";
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
  const [post, branding] = await Promise.all([
    blogPostRepository.findPublishedBySlug(slug),
    getBrandingSettings(),
  ]);

  if (!post) {
    return {};
  }

  const metadata = await resolveMetadataFromSeo({
    locale,
    path: `/blog/${post.slug}`,
    seo: post.seoMeta,
    ogImage: resolveBlogOgImageUrl(post, branding),
    fallbacks: {
      title: {
        en: post.seoMeta?.metaTitleEn ?? `${post.titleEn} | PakExcise.com`,
        ur: post.seoMeta?.metaTitleUr ?? `${post.titleUr} | PakExcise.com`,
      },
      description: {
        en: post.excerptEn ?? post.contentEn.slice(0, 160),
        ur: post.excerptUr ?? post.contentUr.slice(0, 160),
      },
      h1: {
        en: post.seoMeta?.h1En ?? post.titleEn,
        ur: post.seoMeta?.h1Ur ?? post.titleUr,
      },
    },
  });

  if (post.focusKeywords?.trim()) {
    return {
      ...metadata,
      keywords: post.focusKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    };
  }

  return metadata;
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
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const [attachedFaqs, branding, business, relatedPosts] = await Promise.all([
    loadAttachedFaqs(post.attachedFaqIds),
    getBrandingSettings(),
    getBusinessSettings(),
    blogPostRepository.findRelatedPublished(
      {
        id: post.id,
        slug: post.slug,
        categoryEn: post.categoryEn,
        tags: post.tags,
      },
      3,
    ),
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
  const category = pickLocalized(locale, {
    en: post.categoryEn,
    ur: post.categoryUr,
  });
  const author = pickLocalized(locale, {
    en: post.authorNameEn,
    ur: post.authorNameUr,
  });

  const resolvedPost = resolveBlogCtaFields(post);

  const contentFaqs = mapBlogContentFaqsForLocale(
    resolveBlogContentFaqs(parseBlogContentFaqs(post.contentFaqs)),
    locale,
  );
  const attachedFaqItems = mapFaqsForLocale(attachedFaqs, locale);
  const faqItems = mergeBlogFaqItems(contentFaqs, attachedFaqItems);

  const tocItems = post.showTableOfContents
    ? extractBlogTableOfContents(content)
    : [];

  const ctaTitle = pickLocalized(locale, {
    en: resolvedPost.ctaTitleEn,
    ur: resolvedPost.ctaTitleUr,
  }) || t("cta.title");
  const ctaDescription = pickLocalized(locale, {
    en: resolvedPost.ctaDescriptionEn,
    ur: resolvedPost.ctaDescriptionUr,
  }) || t("cta.description");
  const ctaWhatsappLabel = pickLocalized(locale, {
    en: resolvedPost.ctaWhatsappLabelEn,
    ur: resolvedPost.ctaWhatsappLabelUr,
  }) || t("cta.whatsapp");
  const ctaRequestLabel = pickLocalized(locale, {
    en: resolvedPost.ctaRequestLabelEn,
    ur: resolvedPost.ctaRequestLabelUr,
  }) || t("cta.request");
  const ctaAccountLabel = pickLocalized(locale, {
    en: resolvedPost.ctaAccountLabelEn,
    ur: resolvedPost.ctaAccountLabelUr,
  }) || t("cta.account");

  const pageUrl = absoluteUrl(`/blog/${post.slug}`);
  const ogImageUrl = resolveBlogOgImageUrl(post, branding);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: title, url: pageUrl },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqItems);
  const articleJsonLd = buildArticleJsonLd({
    type: "BlogPosting",
    headline: title,
    description:
      excerpt ??
      content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    url: pageUrl,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    imageUrl: ogImageUrl,
    publisherName: business.siteName,
    publisherLogoUrl: resolveSeoImageUrl(branding.logoPath),
    inLanguage: locale === "ur" ? "ur-PK" : "en-PK",
    authorName: author ?? undefined,
  });
  const jsonLd = [breadcrumbJsonLd, articleJsonLd, faqJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="border-b bg-gradient-to-b from-primary/5 to-background dark:from-primary/10 dark:to-background">
        <div className="container-site space-y-6 py-10 md:space-y-8 md:py-12">
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: t("title"), href: "/blog" },
              { label: title },
            ]}
          />

          <div className="space-y-4">
            <BlogPostMetaBar
              locale={locale}
              category={category}
              author={author}
              publishedAt={post.publishedAt}
              updatedAt={post.updatedAt}
              readingTimeMinutes={post.readingTimeMinutes}
              readingTimeLabel={t("readingTime")}
              updatedLabel={t("updated")}
            />
            <h1 className="text-bidi-auto max-w-4xl text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {excerpt ? (
              <p className="text-bidi-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {excerpt}
              </p>
            ) : null}
            {post.tags.length > 0 ? (
              <BlogPostTags tags={post.tags} title={t("tags")} />
            ) : null}
          </div>

          <BlogFeaturedImage post={post} locale={locale} />
        </div>
      </article>

      <div className="container-site py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-14 xl:gap-16">
          <div className="min-w-0 space-y-10">
            {tocItems.length > 0 ? (
              <div className="lg:hidden">
                <BlogTableOfContents items={tocItems} title={t("tableOfContents")} />
              </div>
            ) : null}

            <ProseContent
              content={content}
              className="max-w-none overflow-x-hidden break-words [&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:scroll-mt-28 [&_h3]:mb-3 [&_img]:h-auto [&_img]:max-w-full"
            />

            <BlogFaqSection items={faqItems} title={t("faqs")} />

            <BlogPostCta
              title={ctaTitle}
              description={ctaDescription}
              whatsappLabel={ctaWhatsappLabel}
              requestLabel={ctaRequestLabel}
              accountLabel={ctaAccountLabel}
            />

            <BlogShareButtons
              url={pageUrl}
              title={title}
              shareLabel={t("share")}
              copiedLabel={t("copied")}
              labels={{
                facebook: t("shareChannels.facebook"),
                linkedin: t("shareChannels.linkedin"),
                whatsapp: t("shareChannels.whatsapp"),
                x: t("shareChannels.x"),
                telegram: t("shareChannels.telegram"),
                email: t("shareChannels.email"),
                copyLink: t("shareChannels.copyLink"),
              }}
            />

            <BlogRelatedPosts
              posts={relatedPosts}
              locale={locale}
              title={t("relatedPosts")}
              readMoreLabel={tCommon("learnMore")}
              readingTimeLabel={t("readingTime")}
            />
          </div>

          <BlogPostSidebar
            tocItems={tocItems}
            tableOfContentsTitle={t("tableOfContents")}
            sidebarTitle={t("sidebar.title")}
            sidebarDescription={t("sidebar.description")}
            servicesLabel={t("sidebar.services")}
            whatsappLabel={t("sidebar.whatsapp")}
          />
        </div>
      </div>
    </>
  );
}
