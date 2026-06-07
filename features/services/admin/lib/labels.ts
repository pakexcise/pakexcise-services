import { getTranslations } from "next-intl/server";

export type ServiceEditorLabels = Awaited<
  ReturnType<typeof getServiceEditorLabels>
>;
export type DocumentPanelLabels = Awaited<
  ReturnType<typeof getDocumentPanelLabels>
>;
export type FormFieldsPanelLabels = Awaited<
  ReturnType<typeof getFormFieldsPanelLabels>
>;

export async function getServiceEditorLabels() {
  const t = await getTranslations("admin.services.form");

  return {
    tabGeneral: t("tabs.general"),
    tabSeo: t("tabs.seo"),
    slug: t("slug"),
    region: t("region"),
    selectRegion: t("selectRegion"),
    nameEn: t("nameEn"),
    nameUr: t("nameUr"),
    shortDescriptionEn: t("shortDescriptionEn"),
    shortDescriptionUr: t("shortDescriptionUr"),
    contentEn: t("contentEn"),
    contentUr: t("contentUr"),
    ctaTextEn: t("ctaTextEn"),
    ctaTextUr: t("ctaTextUr"),
    processingNotesEn: t("processingNotesEn"),
    processingNotesUr: t("processingNotesUr"),
    requiresProof: t("requiresProof"),
    isActive: t("isActive"),
    displayOrder: t("displayOrder"),
    metaTitleEn: t("metaTitleEn"),
    metaTitleUr: t("metaTitleUr"),
    metaDescriptionEn: t("metaDescriptionEn"),
    metaDescriptionUr: t("metaDescriptionUr"),
    h1En: t("h1En"),
    h1Ur: t("h1Ur"),
    canonicalUrl: t("canonicalUrl"),
    ogTitleEn: t("ogTitleEn"),
    ogTitleUr: t("ogTitleUr"),
    ogDescriptionEn: t("ogDescriptionEn"),
    ogDescriptionUr: t("ogDescriptionUr"),
    ogImage: t("ogImage"),
    robotsIndex: t("robotsIndex"),
    robotsFollow: t("robotsFollow"),
    faqSchemaJson: t("faqSchemaJson"),
    breadcrumbJson: t("breadcrumbJson"),
    save: t("save"),
    saving: t("saving"),
    saveFailed: t("saveFailed"),
    cancel: t("cancel"),
  };
}

export async function getDocumentPanelLabels() {
  const t = await getTranslations("admin.services.documents");

  return {
    existing: t("existing"),
    empty: t("empty"),
    addDocument: t("addDocument"),
    editDocument: t("editDocument"),
    docType: t("docType"),
    labelEn: t("labelEn"),
    labelUr: t("labelUr"),
    instructionsEn: t("instructionsEn"),
    instructionsUr: t("instructionsUr"),
    required: t("required"),
    optional: t("optional"),
    maxSizeBytes: t("maxSizeBytes"),
    acceptedMimeTypes: t("acceptedMimeTypes"),
    displayOrder: t("displayOrder"),
    isActive: t("isActive"),
    saveDocument: t("saveDocument"),
    clear: t("clear"),
    edit: t("edit"),
    delete: t("delete"),
    confirmDelete: t("confirmDelete"),
  };
}

export async function getFormFieldsPanelLabels() {
  const t = await getTranslations("admin.services.fields");

  return {
    existing: t("existing"),
    empty: t("empty"),
    addField: t("addField"),
    editField: t("editField"),
    fieldKey: t("fieldKey"),
    fieldType: t("fieldType"),
    labelEn: t("labelEn"),
    labelUr: t("labelUr"),
    placeholderEn: t("placeholderEn"),
    placeholderUr: t("placeholderUr"),
    helpTextEn: t("helpTextEn"),
    helpTextUr: t("helpTextUr"),
    required: t("required"),
    isEncrypted: t("isEncrypted"),
    isActive: t("isActive"),
    displayOrder: t("displayOrder"),
    optionsJson: t("optionsJson"),
    validationJson: t("validationJson"),
    conditionalJson: t("conditionalJson"),
    saveField: t("saveField"),
    clear: t("clear"),
    edit: t("edit"),
    delete: t("delete"),
    confirmDelete: t("confirmDelete"),
    invalidJson: t("invalidJson"),
  };
}
