import Link from "next/link";
import { CalendarDays, Clock3, UserRound } from "lucide-react";

import { BlogCardImage } from "@/components/marketing/blog-card-image";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveBlogPostCategoryLabel } from "@/features/blog/lib/resolve-blog-post-category";
import { formatDate } from "@/lib/utils";

type BlogCardProps = {
  post: {
    slug: string;
    titleEn: string;
    excerptEn?: string | null;
    categoryEn?: string | null;
    category?: { nameEn: string } | null;
    subCategory?: { nameEn: string } | null;
    authorNameEn?: string | null;
    readingTimeMinutes?: number | null;
    featuredImagePath?: string | null;
    featuredImageAltEn?: string | null;
    publishedAt?: Date | null;
    seoMeta?: {
      ogImage?: string | null;
    } | null;
  };
  locale: string;
  readMoreLabel: string;
  readingTimeLabel?: string;
  featured?: boolean;
};

export function BlogCard({
  post,
  locale,
  readMoreLabel,
  readingTimeLabel = "min read",
  featured = false,
}: BlogCardProps) {
  const title = post.titleEn ?? "";
  const excerpt = post.excerptEn ?? "";
  const category = resolveBlogPostCategoryLabel(locale, post);
  const author = post.authorNameEn ?? "";

  return (
    <Card
      className={`group h-full overflow-hidden p-0 transition-shadow hover:shadow-lg ${
        featured ? "border-primary/30 shadow-md" : ""
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <BlogCardImage post={post} title={title} />
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">
                {category}
              </Badge>
            ) : null}
            {post.publishedAt ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {formatDate(post.publishedAt, locale)}
                </time>
              </p>
            ) : null}
          </div>
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
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
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {readMoreLabel}
            <DirectionalArrow className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
