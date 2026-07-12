import { BlogResponsiveImage } from "@/components/marketing/blog/blog-responsive-image";
import { resolveBlogFeaturedImageAlt } from "@/features/blog/lib/featured-image";
import { resolvePublicImageDimensions } from "@/features/blog/lib/resolve-image-dimensions";
import { resolveBlogFeaturedImage } from "@/lib/i18n/blog-featured-image";
import { cn } from "@/lib/utils";

type BlogFeaturedImageProps = {
  post: {
    titleEn: string;
    featuredImagePath?: string | null;
    featuredImageTitleEn?: string | null;
    featuredImageAltEn?: string | null;
    featuredImageCaptionEn?: string | null;
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
  const title = post.featuredImageTitleEn ?? "";
  const caption = post.featuredImageCaptionEn ?? "";

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
