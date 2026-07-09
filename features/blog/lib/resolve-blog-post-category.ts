import { pickLocalized } from "@/lib/i18n/content";

type CategoryRelation = {
  nameEn: string;
  nameUr: string;
  slug?: string;
} | null | undefined;

type BlogPostCategorySource = {
  categoryEn?: string | null;
  categoryUr?: string | null;
  category?: CategoryRelation;
  subCategory?: CategoryRelation;
};

export function resolveBlogPostCategoryLabel(
  locale: string,
  post: BlogPostCategorySource,
): string | null {
  const category = post.category
    ? pickLocalized(locale, {
        en: post.category.nameEn,
        ur: post.category.nameUr,
      })
    : pickLocalized(locale, {
        en: post.categoryEn,
        ur: post.categoryUr,
      });

  const subCategory = post.subCategory
    ? pickLocalized(locale, {
        en: post.subCategory.nameEn,
        ur: post.subCategory.nameUr,
      })
    : null;

  if (category && subCategory) {
    return `${category} › ${subCategory}`;
  }

  return category ?? subCategory;
}

export function resolveBlogPostPrimaryCategoryLabel(
  locale: string,
  post: BlogPostCategorySource,
): string | null {
  const category = post.category
    ? pickLocalized(locale, {
        en: post.category.nameEn,
        ur: post.category.nameUr,
      })
    : pickLocalized(locale, {
        en: post.categoryEn,
        ur: post.categoryUr,
      });

  return category ?? null;
}

export function resolveBlogPostSubCategoryLabel(
  locale: string,
  post: BlogPostCategorySource,
): string | null {
  if (!post.subCategory) {
    return null;
  }

  return pickLocalized(locale, {
    en: post.subCategory.nameEn,
    ur: post.subCategory.nameUr,
  });
}
