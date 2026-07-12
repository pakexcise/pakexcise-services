import { PAYMENT_METHOD_QR_MAX_BYTES } from "@/config/uploads";
import { formatFileSize } from "@/features/applications/lib/validate-upload";

export async function getPaymentMethodPanelLabels() {
    const qrMaxSize = formatFileSize(PAYMENT_METHOD_QR_MAX_BYTES);

  return {
    existing: "Existing payment methods",
    empty: "No payment methods configured yet.",
    addMethod: "Add payment method",
    editMethod: "Edit payment method",
    code: "Code",
    type: "Type",
    nameEn: "Display name (English)",
    nameEnHint: "Customer-facing label on the invoice, e.g. Meezan Bank, Easypaisa, NayaPay.",
    accountTitleEn: "Account title (English)",
    accountNumber: "Account / wallet number",
    iban: "IBAN",
    bankNameEn: "Bank name (English)",
    instructionsEn: "Instructions (English)",
    isActive: "Active",
    displayOrder: "Display order",
    saveMethod: "Save payment method",
    clear: "Clear form",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this payment method?",
    saveFailed: "Could not save payment method",
    active: "Active",
    inactive: "Inactive",
    moveUp: "Move up",
    moveDown: "Move down",
    qrCode: "QR code image",
    qrCodeHint: "Optional. Upload a high-resolution QR image customers can scan on the invoice and in their application portal.",
    qrCodeUpload: "Upload QR image",
    qrCodeUploading: "Uploading…",
    qrCodeRemove: "Remove QR image",
    qrCodeRemoving: "Removing…",
    qrCodeScanHint: "Preview at full resolution — customers see the same image on invoices.",
    qrCodeSaveFirst: "Save this payment method first, then upload a QR code image.",
    qrCodeUploadFailed: "Could not upload QR image",
    qrCodeInvalidType: "Only JPEG, PNG, or WebP images are allowed",
    qrCodeTooLarge: "QR image is too large",
    qrCodeInvalidName: "Invalid file name",
    qrCodeMaxSize: `Maximum file size: ${qrMaxSize}`,
    types: {
      BANK_TRANSFER: "Bank transfer",
      JAZZCASH: "JazzCash",
      EASYPAISA: "Easypaisa",
      NAYAPAY: "NayaPay",
      SADAPAY: "SadaPay",
      OTHER: "Other"}};
}

export type PaymentMethodPanelLabels = Awaited<
  ReturnType<typeof getPaymentMethodPanelLabels>
>;
