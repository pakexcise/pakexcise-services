import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlogCard } from "@/components/marketing/blog-card";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { requireBlogEnabled } from "@/features/settings/lib/feature-gates";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { blogPostRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("blog");

  return await resolveMetadataFromSeo({
    locale,
    path: "/blog",
    seo,
    fallbacks: {
      title: {
        en: t("blog.metaTitle"),
        ur: t("blog.metaTitle"),
      },
      description: {
        en: t("blog.metaDescription"),
        ur: t("blog.metaDescription"),
      },
      h1: {
        en: t("blog.title"),
        ur: t("blog.title"),
      },
    },
  });
}

export default async function BlogPage() {
  await requireBlogEnabled();
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const seo = await seoMetaRepository.findByPageKey("blog");
  const posts = await blogPostRepository.listPublished();

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? t("blog.title"),
    ur: seo?.h1Ur ?? t("blog.title"),
  });
  const description = pickLocalized(locale, {
    en: seo?.metaDescriptionEn ?? t("blog.metaDescription"),
    ur: seo?.metaDescriptionUr ?? t("blog.metaDescription"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/blog") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site space-y-8 py-10 md:py-12">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                locale={locale}
                readMoreLabel={tCommon("learnMore")}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
