import { BlogResponsiveImage } from "@/components/marketing/blog/blog-responsive-image";
import { resolveBlogFeaturedImageAlt } from "@/features/blog/lib/featured-image";
import { resolvePublicImageDimensions } from "@/features/blog/lib/resolve-image-dimensions";
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
  };
  locale: string;
  priority?: boolean;
  className?: string;
};

export async function BlogFeaturedImage({
  post,
  locale,
  priority = true,
  className,
}: BlogFeaturedImageProps) {
  const imageUrl = resolveBlogFeaturedImage(post);
  if (!imageUrl) {
    return null;
  }

  const naturalDimensions = await resolvePublicImageDimensions(imageUrl);
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
    <figure className={cn("not-prose space-y-3", className)}>
      <BlogResponsiveImage
        src={imageUrl}
        alt={alt}
        title={title || undefined}
        variant="hero"
        priority={priority}
        naturalDimensions={naturalDimensions}
      />
      {caption ? (
        <figcaption className="text-center text-sm leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
