type CategoryRelation = {
  nameEn: string;
  slug?: string;
} | null | undefined;

type BlogPostCategorySource = {
  categoryEn?: string | null;
  category?: CategoryRelation;
  subCategory?: CategoryRelation;
};

export function resolveBlogPostCategoryLabel(
  _locale: string,
  post: BlogPostCategorySource,
): string | null {
  const category = post.category
    ? post.category.nameEn ?? ""
    : post.categoryEn ?? "";

  const subCategory = post.subCategory
    ? post.subCategory.nameEn ?? ""
    : null;

  if (category && subCategory) {
    return `${category} › ${subCategory}`;
  }

  return category ?? subCategory;
}

export function resolveBlogPostPrimaryCategoryLabel(
  _locale: string,
  post: BlogPostCategorySource,
): string | null {
  const category = post.category
    ? post.category.nameEn ?? ""
    : post.categoryEn ?? "";

  return category ?? null;
}

export function resolveBlogPostSubCategoryLabel(
  _locale: string,
  post: BlogPostCategorySource,
): string | null {
  if (!post.subCategory) {
    return null;
  }

  return post.subCategory.nameEn ?? "";
}
