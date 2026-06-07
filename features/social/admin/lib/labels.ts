import { getTranslations } from "next-intl/server";

export type SocialPanelLabels = Awaited<ReturnType<typeof getSocialPanelLabels>>;

export async function getSocialPanelLabels() {
  const t = await getTranslations("admin.social");

  return {
    existing: t("existing"),
    empty: t("empty"),
    addLink: t("addLink"),
    editLink: t("editLink"),
    platform: t("platform"),
    url: t("url"),
    iconName: t("iconName"),
    labelEn: t("labelEn"),
    labelUr: t("labelUr"),
    isActive: t("isActive"),
    displayOrder: t("displayOrder"),
    saveLink: t("saveLink"),
    clear: t("clear"),
    edit: t("edit"),
    delete: t("delete"),
    confirmDelete: t("confirmDelete"),
    saveFailed: t("saveFailed"),
    whatsappNotice: t("whatsappNotice"),
    active: t("status.active"),
    inactive: t("status.inactive"),
    moveUp: t("actions.moveUp"),
    moveDown: t("actions.moveDown"),
  };
}
