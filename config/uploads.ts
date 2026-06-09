export const DEFAULT_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AcceptedMimeType = (typeof DEFAULT_ACCEPTED_MIME_TYPES)[number];

export const MIME_TO_EXTENSION: Record<AcceptedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const EXTENSION_TO_MIME: Record<string, AcceptedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;

export const DOCUMENT_VIEW_EXPIRY_SECONDS = 60 * 60;

export const PROOF_DOWNLOAD_EXPIRY_SECONDS = 24 * 60 * 60;

export const INVOICE_DOWNLOAD_EXPIRY_SECONDS = 24 * 60 * 60;

export const COMPLETION_PROOF_DOC_TYPE = "completion_proof";

const DOUBLE_EXTENSION_PATTERN = /\.[^./\\]+$/i;

export type UploadValidationErrorCode =
  | "INVALID_NAME"
  | "DOUBLE_EXTENSION"
  | "INVALID_EXTENSION"
  | "MIME_MISMATCH"
  | "INVALID_MIME"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE";

export type UploadValidationResult =
  | { valid: true; extension: string }
  | { valid: false; code: UploadValidationErrorCode };

export function extensionFromMimeType(mimeType: string): string {
  if (mimeType in MIME_TO_EXTENSION) {
    return MIME_TO_EXTENSION[mimeType as AcceptedMimeType];
  }

  return "bin";
}

export function extensionFromFileName(fileName: string): string | null {
  const trimmed = fileName.trim().toLowerCase();
  const match = trimmed.match(/\.([a-z0-9]+)$/i);
  return match?.[1] ?? null;
}

export function hasDoubleExtension(fileName: string): boolean {
  const trimmed = fileName.trim();
  const withoutFinalExt = trimmed.replace(DOUBLE_EXTENSION_PATTERN, "");
  return DOUBLE_EXTENSION_PATTERN.test(withoutFinalExt);
}

export function validateUploadFile(input: {
  fileName: string;
  mimeType: string;
  fileSize: number;
  maxSizeBytes: number;
  acceptedMimeTypes?: readonly string[];
}): UploadValidationResult {
  const fileName = input.fileName.trim();
  const accepted =
    input.acceptedMimeTypes && input.acceptedMimeTypes.length > 0
      ? input.acceptedMimeTypes
      : DEFAULT_ACCEPTED_MIME_TYPES;

  if (!fileName || fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return { valid: false, code: "INVALID_NAME" };
  }

  if (hasDoubleExtension(fileName)) {
    return { valid: false, code: "DOUBLE_EXTENSION" };
  }

  if (input.fileSize <= 0) {
    return { valid: false, code: "EMPTY_FILE" };
  }

  if (input.fileSize > input.maxSizeBytes) {
    return { valid: false, code: "FILE_TOO_LARGE" };
  }

  if (!accepted.includes(input.mimeType)) {
    return { valid: false, code: "INVALID_MIME" };
  }

  const extension = extensionFromFileName(fileName);

  if (!extension) {
    return { valid: false, code: "INVALID_EXTENSION" };
  }

  const expectedMime = EXTENSION_TO_MIME[extension];

  if (!expectedMime) {
    return { valid: false, code: "INVALID_EXTENSION" };
  }

  if (expectedMime !== input.mimeType) {
    return { valid: false, code: "MIME_MISMATCH" };
  }

  return { valid: true, extension };
}

export function buildApplicationDocumentKey(input: {
  applicationId: string;
  docType: string;
  fileId: string;
  extension: string;
}): string {
  const safeDocType = input.docType.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  const safeExt = input.extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return `applications/${input.applicationId}/${safeDocType}/${input.fileId}.${safeExt || "bin"}`;
}

export function buildPaymentScreenshotKey(input: {
  applicationId: string;
  paymentId: string;
  extension: string;
}): string {
  const safeExt = input.extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return `applications/${input.applicationId}/payments/${input.paymentId}.${safeExt || "bin"}`;
}

export function buildInvoicePdfKey(input: {
  applicationId: string;
  invoiceId: string;
}): string {
  return `applications/${input.applicationId}/invoices/${input.invoiceId}.pdf`;
}

export const PAYMENT_SCREENSHOT_MAX_BYTES = DEFAULT_MAX_FILE_SIZE_BYTES;
