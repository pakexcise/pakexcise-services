import { resolveBlogImageSrc } from "@/features/blog/lib/blog-image-paths";

type BlogPostWithFeaturedImage = {
  featuredImagePath?: string | null;
};

/** Returns the blog featured image path only (no OG/logo fallback). */
export function resolveBlogFeaturedImage(
  post: BlogPostWithFeaturedImage,
): string | null {
  return resolveBlogImageSrc(post.featuredImagePath);
}
