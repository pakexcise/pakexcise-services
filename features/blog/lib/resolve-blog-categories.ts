type CategoryLike = {
  nameEn: string;
} | null | undefined;

export function resolveBlogCategoryLabels(
  _locale: string,
  category: CategoryLike,
  subCategory: CategoryLike,
): { category: string | null; subCategory: string | null; combined: string | null } {
  const categoryLabel = category
    ? category.nameEn ?? ""
    : null;
  const subCategoryLabel = subCategory
    ? subCategory.nameEn ?? ""
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
