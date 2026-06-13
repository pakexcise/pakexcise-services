import "server-only";

import {
  buildPaymentMethodQrKey,
  extensionFromMimeType,
  PAYMENT_METHOD_QR_MAX_BYTES,
  PAYMENT_METHOD_QR_MIME_TYPES,
  validateUploadFile,
  type PaymentMethodQrMimeType,
} from "@/config/uploads";
import { readStoredObject } from "@/server/storage/object-storage";

export function isPaymentMethodQrMimeType(
  mimeType: string,
): mimeType is PaymentMethodQrMimeType {
  return (PAYMENT_METHOD_QR_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function buildPaymentMethodQrObjectKey(input: {
  paymentMethodId: string;
  mimeType: PaymentMethodQrMimeType;
}): string {
  return buildPaymentMethodQrKey({
    paymentMethodId: input.paymentMethodId,
    extension: extensionFromMimeType(input.mimeType),
  });
}

export function validatePaymentMethodQrUpload(input: {
  fileName: string;
  mimeType: string;
  fileSize: number;
}) {
  return validateUploadFile({
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    maxSizeBytes: PAYMENT_METHOD_QR_MAX_BYTES,
    acceptedMimeTypes: [...PAYMENT_METHOD_QR_MIME_TYPES],
  });
}

function detectImageMimeType(buffer: Buffer, fallbackMimeType: string): string {
  if (buffer.length >= 4) {
    const signature = buffer.subarray(0, 4).toString("hex");

    if (signature.startsWith("ffd8ff")) {
      return "image/jpeg";
    }

    if (signature === "89504e47") {
      return "image/png";
    }

    if (buffer.subarray(0, 4).toString("ascii") === "RIFF") {
      return "image/webp";
    }
  }

  return fallbackMimeType;
}

export async function getStoredImageDataUri(input: {
  key: string;
  mimeType: string;
}): Promise<string | null> {
  try {
    const buffer = await readStoredObject(input.key);
    const mimeType = detectImageMimeType(buffer, input.mimeType);
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}
