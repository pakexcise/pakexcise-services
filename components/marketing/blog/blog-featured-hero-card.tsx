import { CalendarDays, Clock3, UserRound } from "lucide-react";

import { BlogResponsiveImage } from "@/components/marketing/blog/blog-responsive-image";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { resolveBlogPostCategoryLabel } from "@/features/blog/lib/resolve-blog-post-category";
import { resolvePublicImageDimensions } from "@/features/blog/lib/resolve-image-dimensions";
import { Link } from "@/i18n/navigation";
import { resolveBlogFeaturedImage } from "@/lib/i18n/blog-featured-image";
import { pickLocalized } from "@/lib/i18n/content";
import { formatDate } from "@/lib/utils";

type BlogFeaturedHeroCardProps = {
  post: {
    slug: string;
    titleEn: string;
    titleUr: string;
    excerptEn?: string | null;
    excerptUr?: string | null;
    categoryEn?: string | null;
    categoryUr?: string | null;
    category?: { nameEn: string; nameUr: string } | null;
    subCategory?: { nameEn: string; nameUr: string } | null;
    authorNameEn?: string | null;
    authorNameUr?: string | null;
    readingTimeMinutes?: number | null;
    featuredImagePath?: string | null;
    featuredImageAltEn?: string | null;
    featuredImageAltUr?: string | null;
    publishedAt?: Date | null;
    seoMeta?: {
      ogImage?: string | null;
    } | null;
  };
  locale: string;
  readMoreLabel: string;
  readingTimeLabel: string;
};

export async function BlogFeaturedHeroCard({
  post,
  locale,
  readMoreLabel,
  readingTimeLabel,
}: BlogFeaturedHeroCardProps) {
  const title = pickLocalized(locale, { en: post.titleEn, ur: post.titleUr });
  const excerpt = pickLocalized(locale, {
    en: post.excerptEn,
    ur: post.excerptUr,
  });
  const category = resolveBlogPostCategoryLabel(locale, post);
  const author = pickLocalized(locale, {
    en: post.authorNameEn,
    ur: post.authorNameUr,
  });
  const imageUrl = resolveBlogFeaturedImage(post);
  const naturalDimensions = imageUrl
    ? await resolvePublicImageDimensions(imageUrl)
    : null;
  const imageAlt =
    pickLocalized(locale, {
      en: post.featuredImageAltEn,
      ur: post.featuredImageAltUr,
    }) || title;

  return (
    <Card className="group overflow-hidden border-primary/20 p-0 shadow-md transition-shadow hover:shadow-lg">
      <Link
        href={`/blog/${post.slug}`}
        className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <div className="bg-muted/10 p-3 sm:p-4">
          {imageUrl ? (
            <BlogResponsiveImage
              src={imageUrl}
              alt={imageAlt}
              variant="card"
              priority
              naturalDimensions={naturalDimensions}
              className="rounded-xl"
            />
          ) : (
            <div className="relative aspect-[16/10] w-full rounded-xl bg-muted/20" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">
                {category}
              </Badge>
            ) : null}
            {post.publishedAt ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt, locale)}
                </time>
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary md:text-3xl">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {excerpt}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {author ? (
              <span className="inline-flex items-center gap-1">
                <UserRound className="size-3.5" aria-hidden="true" />
                {author}
              </span>
            ) : null}
            {post.readingTimeMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {post.readingTimeMinutes} {readingTimeLabel}
              </span>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {readMoreLabel}
            <DirectionalArrow className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Card>
  );
}
