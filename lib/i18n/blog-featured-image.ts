type BlogPostWithSeo = {
  seoMeta?: {
    ogImage?: string | null;
  } | null;
};

export function resolveBlogFeaturedImage(
  post: BlogPostWithSeo,
): string | null {
  const customImage = post.seoMeta?.ogImage?.trim();
  return customImage || null;
}
