import type { AdminFaqCategoryDetail } from "@/server/repositories/admin-faq-category-repository";

export type FaqCategoryEditorValues = {
  slug: string;
  nameEn: string;
  descriptionEn: string;
  isActive: boolean;
  displayOrder: number;
};

export function emptyFaqCategoryEditorValues(
  displayOrder = 0,
): FaqCategoryEditorValues {
  return {
    slug: "",
    nameEn: "",
    descriptionEn: "",
    isActive: true,
    displayOrder};
}

export function faqCategoryDetailToEditorValues(
  category: AdminFaqCategoryDetail,
): FaqCategoryEditorValues {
  return {
    slug: category.slug,
    nameEn: category.nameEn,
    descriptionEn: category.descriptionEn ?? "",
    isActive: category.isActive,
    displayOrder: category.displayOrder};
}

export function editorValuesToPayload(values: FaqCategoryEditorValues) {
  return {
    slug: values.slug.trim().toLowerCase(),
    nameEn: values.nameEn.trim(),
    descriptionEn: values.descriptionEn.trim() || null,
    isActive: values.isActive,
    displayOrder: values.displayOrder};
}
