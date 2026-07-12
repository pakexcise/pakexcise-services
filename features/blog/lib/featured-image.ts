import type { PublicBlogPostCard } from "@/features/blog/types";
import type { BrandingSettings } from "@/features/settings/types";
import { resolveLogoIconPath } from "@/features/settings/lib/branding-resolvers";
import { resolveSeoImageUrl } from "@/lib/seo-url";

/** OG/social image: featured image when set, otherwise site logo icon. */
export function resolveBlogOgImagePath(
  post: Pick<PublicBlogPostCard, "featuredImagePath">,
  branding: BrandingSettings,
): string {
  const featured = post.featuredImagePath?.trim();
  if (featured) {
    return featured;
  }

  return resolveLogoIconPath(branding);
}

export function resolveBlogOgImageUrl(
  post: Pick<PublicBlogPostCard, "featuredImagePath">,
  branding: BrandingSettings,
): string {
  const path = resolveBlogOgImagePath(post, branding);
  return resolveSeoImageUrl(path) ?? path;
}

export function resolveBlogFeaturedImageAlt(
  post: Pick<PublicBlogPostCard, "titleEn" | "featuredImageAltEn">,
  _locale?: string,
): string {
  return post.featuredImageAltEn?.trim() || post.titleEn;
}
