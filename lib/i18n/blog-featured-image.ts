type BlogPostWithFeaturedImage = {
  featuredImagePath?: string | null;
};

/** Returns the blog featured image path only (no OG/logo fallback). */
export function resolveBlogFeaturedImage(
  post: BlogPostWithFeaturedImage,
): string | null {
  const featured = post.featuredImagePath?.trim();
  return featured || null;
}
