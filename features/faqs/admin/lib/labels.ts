import { getTranslations } from "next-intl/server";

export type FaqEditorLabels = Awaited<ReturnType<typeof getFaqEditorLabels>>;
export type FaqListLabels = Awaited<ReturnType<typeof getFaqListLabels>>;

export async function getFaqEditorLabels() {
  const t = await getTranslations("admin.faqs.form");

  return {
    questionEn: t("questionEn"),
    questionUr: t("questionUr"),
    answerEn: t("answerEn"),
    answerUr: t("answerUr"),
    category: t("category"),
    selectCategory: t("selectCategory"),
    unknownCategory: t("unknownCategory"),
    inactiveCategory: t("inactiveCategory"),
    service: t("service"),
    noService: t("noService"),
    serviceHint: t("serviceHint"),
    region: t("region"),
    noRegion: t("noRegion"),
    regionHint: t("regionHint"),
    seoKeywordsEn: t("seoKeywordsEn"),
    seoKeywordsUr: t("seoKeywordsUr"),
    seoKeywordsPlaceholder: t("seoKeywordsPlaceholder"),
    isActive: t("isActive"),
    isFeatured: t("isFeatured"),
    featuredHint: t("featuredHint"),
    featuredDisplayOrder: t("featuredDisplayOrder"),
    displayOrder: t("displayOrder"),
    save: t("save"),
    saving: t("saving"),
    saveFailed: t("saveFailed"),
    cancel: t("cancel"),
  };
}

export async function getFaqListLabels() {
  const t = await getTranslations("admin.faqs");

  return {
    edit: t("actions.edit"),
    delete: t("actions.delete"),
    confirmDelete: t("actions.confirmDelete"),
    active: t("status.active"),
    inactive: t("status.inactive"),
    moveUp: t("actions.moveUp"),
    moveDown: t("actions.moveDown"),
  };
}
