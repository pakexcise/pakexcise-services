import { getTranslations } from "next-intl/server";

export async function getPaymentMethodPanelLabels() {
  const t = await getTranslations("admin.paymentMethods");

  return {
    existing: t("existing"),
    empty: t("empty"),
    addMethod: t("addMethod"),
    editMethod: t("editMethod"),
    code: t("code"),
    type: t("type"),
    nameEn: t("nameEn"),
    nameEnHint: t("nameEnHint"),
    nameUr: t("nameUr"),
    nameUrHint: t("nameUrHint"),
    accountTitleEn: t("accountTitleEn"),
    accountTitleUr: t("accountTitleUr"),
    accountNumber: t("accountNumber"),
    iban: t("iban"),
    bankNameEn: t("bankNameEn"),
    bankNameUr: t("bankNameUr"),
    instructionsEn: t("instructionsEn"),
    instructionsUr: t("instructionsUr"),
    isActive: t("isActive"),
    displayOrder: t("displayOrder"),
    saveMethod: t("saveMethod"),
    clear: t("clear"),
    edit: t("edit"),
    delete: t("delete"),
    confirmDelete: t("confirmDelete"),
    saveFailed: t("saveFailed"),
    active: t("status.active"),
    inactive: t("status.inactive"),
    moveUp: t("actions.moveUp"),
    moveDown: t("actions.moveDown"),
    types: {
      BANK_TRANSFER: t("types.bankTransfer"),
      JAZZCASH: t("types.jazzcash"),
      EASYPAISA: t("types.easypaisa"),
      NAYAPAY: t("types.nayapay"),
      SADAPAY: t("types.sadapay"),
      OTHER: t("types.other"),
    },
  };
}

export type PaymentMethodPanelLabels = Awaited<
  ReturnType<typeof getPaymentMethodPanelLabels>
>;
