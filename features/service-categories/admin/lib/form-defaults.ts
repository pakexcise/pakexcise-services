export type ServiceCategoryEditorValues = {
  slug: string;
  nameEn: string;
  descriptionEn: string;
  isActive: boolean;
  displayOrder: number;
};

export function emptyServiceCategoryEditorValues(
  displayOrder = 0,
): ServiceCategoryEditorValues {
  return {
    slug: "",
    nameEn: "",
    descriptionEn: "",
    isActive: true,
    displayOrder};
}

export function categoryToEditorValues(
  category: {
    slug: string;
    nameEn: string;
    descriptionEn: string | null;
    isActive: boolean;
    displayOrder: number;
  },
): ServiceCategoryEditorValues {
  return {
    slug: category.slug,
    nameEn: category.nameEn,
    descriptionEn: category.descriptionEn ?? "",
    isActive: category.isActive,
    displayOrder: category.displayOrder};
}

export function editorValuesToPayload(values: ServiceCategoryEditorValues) {
  return {
    ...values,
    descriptionEn: values.descriptionEn || null};
}
