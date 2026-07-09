import { pickLocalized } from "@/lib/i18n/content";

type CategoryLike = {
  nameEn: string;
  nameUr: string;
} | null | undefined;

export function resolveBlogCategoryLabels(
  locale: string,
  category: CategoryLike,
  subCategory: CategoryLike,
): { category: string | null; subCategory: string | null; combined: string | null } {
  const categoryLabel = category
    ? pickLocalized(locale, { en: category.nameEn, ur: category.nameUr })
    : null;
  const subCategoryLabel = subCategory
    ? pickLocalized(locale, { en: subCategory.nameEn, ur: subCategory.nameUr })
    : null;

  const combined =
    categoryLabel && subCategoryLabel
      ? `${categoryLabel} › ${subCategoryLabel}`
      : categoryLabel ?? subCategoryLabel;

  return {
    category: categoryLabel,
    subCategory: subCategoryLabel,
    combined,
  };
}
