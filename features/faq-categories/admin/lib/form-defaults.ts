import type { AdminFaqCategoryDetail } from "@/server/repositories/admin-faq-category-repository";

export type FaqCategoryEditorValues = {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  isActive: boolean;
  displayOrder: number;
};

export function emptyFaqCategoryEditorValues(
  displayOrder = 0,
): FaqCategoryEditorValues {
  return {
    slug: "",
    nameEn: "",
    nameUr: "",
    descriptionEn: "",
    descriptionUr: "",
    isActive: true,
    displayOrder,
  };
}

export function faqCategoryDetailToEditorValues(
  category: AdminFaqCategoryDetail,
): FaqCategoryEditorValues {
  return {
    slug: category.slug,
    nameEn: category.nameEn,
    nameUr: category.nameUr,
    descriptionEn: category.descriptionEn ?? "",
    descriptionUr: category.descriptionUr ?? "",
    isActive: category.isActive,
    displayOrder: category.displayOrder,
  };
}

export function editorValuesToPayload(values: FaqCategoryEditorValues) {
  return {
    slug: values.slug.trim().toLowerCase(),
    nameEn: values.nameEn.trim(),
    nameUr: values.nameUr.trim(),
    descriptionEn: values.descriptionEn.trim() || null,
    descriptionUr: values.descriptionUr.trim() || null,
    isActive: values.isActive,
    displayOrder: values.displayOrder,
  };
}
