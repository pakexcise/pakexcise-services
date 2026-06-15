export type ServiceCategoryEditorValues = {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  isActive: boolean;
  displayOrder: number;
};

export function emptyServiceCategoryEditorValues(
  displayOrder = 0,
): ServiceCategoryEditorValues {
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

export function categoryToEditorValues(
  category: {
    slug: string;
    nameEn: string;
    nameUr: string;
    descriptionEn: string | null;
    descriptionUr: string | null;
    isActive: boolean;
    displayOrder: number;
  },
): ServiceCategoryEditorValues {
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

export function editorValuesToPayload(values: ServiceCategoryEditorValues) {
  return {
    ...values,
    descriptionEn: values.descriptionEn || null,
    descriptionUr: values.descriptionUr || null,
  };
}
