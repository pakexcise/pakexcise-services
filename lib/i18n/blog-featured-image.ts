type BlogPostWithSeo = {
  featuredImagePath?: string | null;
  seoMeta?: {
    ogImage?: string | null;
  } | null;
};

export function resolveBlogFeaturedImage(
  post: BlogPostWithSeo,
): string | null {
  const featured = post.featuredImagePath?.trim();
  if (featured) {
    return featured;
  }

  const customImage = post.seoMeta?.ogImage?.trim();
  return customImage || null;
}
