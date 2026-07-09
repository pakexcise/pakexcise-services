import type { PublicBlogPostCard } from "@/features/blog/types";
import { resolveSeoImageUrl } from "@/lib/seo-url";

export function resolveBlogFeaturedImage(
  post: Pick<PublicBlogPostCard, "featuredImagePath" | "seoMeta">,
): string | null {
  const featured = post.featuredImagePath?.trim();
  if (featured) {
    return resolveSeoImageUrl(featured) ?? featured;
  }

  const ogImage = post.seoMeta?.ogImage?.trim();
  if (ogImage) {
    return resolveSeoImageUrl(ogImage) ?? ogImage;
  }

  return null;
}

export function resolveBlogFeaturedImageAlt(
  post: Pick<
    PublicBlogPostCard,
    "titleEn" | "titleUr" | "featuredImageAltEn" | "featuredImageAltUr"
  >,
  locale: string,
): string {
  if (locale === "ur") {
    return post.featuredImageAltUr?.trim() || post.titleUr;
  }

  return post.featuredImageAltEn?.trim() || post.titleEn;
}
