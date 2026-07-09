import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlogFeaturedHeroCard } from "@/components/marketing/blog/blog-featured-hero-card";
import { BlogCard } from "@/components/marketing/blog-card";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { requireBlogEnabled } from "@/features/settings/lib/feature-gates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { blogPostRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  await requireBlogEnabled();
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const seo = await seoMetaRepository.findByPageKey("blog");

  const [featuredPost, categories] = await Promise.all([
    blogPostRepository.findFeaturedPublished(),
    blogPostRepository.listPublishedCategories(),
  ]);

  const showFeatured =
    Boolean(featuredPost) && page === 1 && !q && !category && !tag;

  const postsResult = await blogPostRepository.listPublishedPaginated({
    page,
    pageSize: 12,
    q,
    category,
    tag,
    excludeSlug: showFeatured ? featuredPost?.slug : undefined,
  });

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

  const listItems = [
    ...(showFeatured && featuredPost
      ? [
          {
            name: pickLocalized(locale, {
              en: featuredPost.titleEn,
              ur: featuredPost.titleUr,
            }),
            url: absoluteUrl(`/blog/${featuredPost.slug}`),
          },
        ]
      : []),
    ...postsResult.items.map((post) => ({
      name: pickLocalized(locale, { en: post.titleEn, ur: post.titleUr }),
      url: absoluteUrl(`/blog/${post.slug}`),
    })),
  ];

  const itemListJsonLd =
    listItems.length > 0
      ? buildItemListJsonLd({
          name: title,
          items: listItems,
        })
      : null;

  const jsonLd = [breadcrumbJsonLd, itemListJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  const searchParamsForPagination = {
    ...(q ? { q } : {}),
    ...(category ? { category } : {}),
    ...(tag ? { tag } : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site space-y-10 py-10 md:space-y-12 md:py-12">
        <form action="/blog" method="get" className="flex flex-wrap gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("blog.searchPlaceholder")}
            className="max-w-sm"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">{t("blog.allCategories")}</option>
            {categories.map((item) => (
              <option key={item.categoryEn ?? ""} value={item.categoryEn ?? ""}>
                {pickLocalized(locale, {
                  en: item.categoryEn,
                  ur: item.categoryUr,
                })}
              </option>
            ))}
          </select>
          <Input
            name="tag"
            defaultValue={tag ?? ""}
            placeholder={t("blog.tagPlaceholder")}
            className="max-w-xs"
          />
          <Button type="submit">{t("blog.filter")}</Button>
        </form>

        {showFeatured && featuredPost ? (
          <section className="space-y-4" aria-labelledby="featured-blog-heading">
            <h2 id="featured-blog-heading" className="text-2xl font-bold text-foreground">
              {t("blog.featured")}
            </h2>
            <BlogFeaturedHeroCard
              post={featuredPost}
              locale={locale}
              readMoreLabel={tCommon("learnMore")}
              readingTimeLabel={t("blog.readingTime")}
            />
          </section>
        ) : null}

        {postsResult.items.length > 0 ? (
          <section className="space-y-6" aria-labelledby="latest-blog-heading">
            <h2 id="latest-blog-heading" className="text-xl font-semibold text-foreground">
              {t("blog.latest")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {postsResult.items.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  locale={locale}
                  readMoreLabel={tCommon("learnMore")}
                  readingTimeLabel={t("blog.readingTime")}
                />
              ))}
            </div>
            <PaginationControls
              page={postsResult.page}
              totalPages={postsResult.totalPages}
              basePath="/blog"
              searchParams={searchParamsForPagination}
            />
          </section>
        ) : !showFeatured ? (
          <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
        ) : null}
      </div>
    </>
  );
}
