import { getTranslations } from "next-intl/server";

import { PAYMENT_METHOD_QR_MAX_BYTES } from "@/config/uploads";
import { formatFileSize } from "@/features/applications/lib/validate-upload";

export async function getPaymentMethodPanelLabels() {
  const t = await getTranslations("admin.paymentMethods");
  const qrMaxSize = formatFileSize(PAYMENT_METHOD_QR_MAX_BYTES);

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
    qrCode: t("qrCode"),
    qrCodeHint: t("qrCodeHint"),
    qrCodeUpload: t("qrCodeUpload"),
    qrCodeUploading: t("qrCodeUploading"),
    qrCodeRemove: t("qrCodeRemove"),
    qrCodeRemoving: t("qrCodeRemoving"),
    qrCodeScanHint: t("qrCodeScanHint"),
    qrCodeSaveFirst: t("qrCodeSaveFirst"),
    qrCodeUploadFailed: t("qrCodeUploadFailed"),
    qrCodeInvalidType: t("qrCodeInvalidType"),
    qrCodeTooLarge: t("qrCodeTooLarge"),
    qrCodeInvalidName: t("qrCodeInvalidName"),
    qrCodeMaxSize: t("qrCodeMaxSize", { size: qrMaxSize }),
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
