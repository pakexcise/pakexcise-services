import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { blogPostRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("blog");

  return resolveMetadataFromSeo({
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
      <div className="container-site py-10 md:py-12">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => {
              const postTitle = pickLocalized(locale, {
                en: post.titleEn,
                ur: post.titleUr,
              });
              const excerpt = pickLocalized(locale, {
                en: post.excerptEn,
                ur: post.excerptUr,
              });

              return (
                <Card key={post.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{postTitle}</CardTitle>
                    {excerpt ? <CardDescription>{excerpt}</CardDescription> : null}
                    {post.publishedAt ? (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(post.publishedAt, locale)}
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="link" className="px-0">
                      <Link href={`/blog/${post.slug}`}>
                        {tCommon("learnMore")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
