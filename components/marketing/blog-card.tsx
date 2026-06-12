import { CalendarDays } from "lucide-react";

import { BlogCardImage } from "@/components/marketing/blog-card-image";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { formatDate } from "@/lib/utils";

type BlogCardProps = {
  post: {
    slug: string;
    titleEn: string;
    titleUr: string;
    excerptEn?: string | null;
    excerptUr?: string | null;
    publishedAt?: Date | null;
    seoMeta?: {
      ogImage?: string | null;
    } | null;
  };
  locale: string;
  readMoreLabel: string;
};

export function BlogCard({ post, locale, readMoreLabel }: BlogCardProps) {
  const title = pickLocalized(locale, { en: post.titleEn, ur: post.titleUr });
  const excerpt = pickLocalized(locale, {
    en: post.excerptEn,
    ur: post.excerptUr,
  });

  return (
    <Card className="group h-full overflow-hidden p-0 transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <BlogCardImage post={post} title={title} />
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          {post.publishedAt ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt, locale)}
              </time>
            </p>
          ) : null}
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          ) : null}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {readMoreLabel}
            <DirectionalArrow className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
