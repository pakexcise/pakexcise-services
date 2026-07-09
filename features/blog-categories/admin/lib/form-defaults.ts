import type { AdminBlogCategoryDetail } from "@/server/repositories/admin-blog-category-repository";

export type BlogCategoryEditorValues = {
  slug: string;
  nameEn: string;
  nameUr: string;
  parentId: string;
  isActive: boolean;
  displayOrder: number;
};

export function emptyBlogCategoryEditorValues(
  displayOrder = 0,
): BlogCategoryEditorValues {
  return {
    slug: "",
    nameEn: "",
    nameUr: "",
    parentId: "",
    isActive: true,
    displayOrder,
  };
}

export function blogCategoryDetailToEditorValues(
  category: AdminBlogCategoryDetail,
): BlogCategoryEditorValues {
  return {
    slug: category.slug,
    nameEn: category.nameEn,
    nameUr: category.nameUr,
    parentId: category.parentId ?? "",
    isActive: category.isActive,
    displayOrder: category.displayOrder,
  };
}

export function editorValuesToPayload(values: BlogCategoryEditorValues) {
  return {
    slug: values.slug.trim().toLowerCase(),
    nameEn: values.nameEn.trim(),
    nameUr: values.nameUr.trim(),
    parentId: values.parentId.trim() || null,
    isActive: values.isActive,
    displayOrder: values.displayOrder,
  };
}
