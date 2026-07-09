import Image from "next/image";

import { resolveBlogFeaturedImageAlt } from "@/features/blog/lib/featured-image";
import { resolveBlogFeaturedImage } from "@/lib/i18n/blog-featured-image";
import { pickLocalized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

type BlogFeaturedImageProps = {
  post: {
    titleEn: string;
    titleUr: string;
    featuredImagePath?: string | null;
    featuredImageTitleEn?: string | null;
    featuredImageTitleUr?: string | null;
    featuredImageAltEn?: string | null;
    featuredImageAltUr?: string | null;
    featuredImageCaptionEn?: string | null;
    featuredImageCaptionUr?: string | null;
    seoMeta?: {
      ogImage?: string | null;
    } | null;
  };
  locale: string;
  priority?: boolean;
  className?: string;
};

export function BlogFeaturedImage({
  post,
  locale,
  priority = true,
  className,
}: BlogFeaturedImageProps) {
  const imageUrl = resolveBlogFeaturedImage(post);
  if (!imageUrl) {
    return null;
  }

  const alt = resolveBlogFeaturedImageAlt(post, locale);
  const title = pickLocalized(locale, {
    en: post.featuredImageTitleEn,
    ur: post.featuredImageTitleUr,
  });
  const caption = pickLocalized(locale, {
    en: post.featuredImageCaptionEn,
    ur: post.featuredImageCaptionUr,
  });

  return (
    <figure className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={imageUrl}
          alt={alt}
          title={title || undefined}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="border-t px-4 py-3 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
