import "server-only";

import { PAYMENT_SCREENSHOT_MAX_BYTES } from "@/config/uploads";
import type { CurrentUser } from "@/server/auth/current-user";
import { canReplacePaymentProof } from "@/features/payments/lib/payment-proof-state";
import {
  getPaymentForUploadAccess,
  type PaymentForUploadAccess,
} from "@/features/payments/lib/payment-upload-access";
import {
  isObjectStorageConfigured,
  putStoredObject,
} from "@/server/storage/object-storage";

export type PaymentUploadHandlerError = {
  status: number;
  error: string;
};

type PaymentUploadRecord = Pick<
  PaymentForUploadAccess,
  | "id"
  | "applicationId"
  | "status"
  | "screenshotR2Key"
  | "screenshotMimeType"
  | "screenshotFileSize"
> & {
  application: { status: string };
};

function validatePaymentUploadState(
  payment: PaymentUploadRecord,
): PaymentUploadHandlerError | null {
  if (!canReplacePaymentProof(payment.application.status, payment.status)) {
    return {
      status: 400,
      error: "Payment proof cannot be uploaded or replaced at this stage",
    };
  }

  if (!payment.screenshotR2Key || !payment.screenshotMimeType) {
    return { status: 400, error: "Start upload before sending the file" };
  }

  return null;
}

export async function handleUploadPaymentScreenshotBytes(
  user: CurrentUser,
  paymentId: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<{ ok: true } | PaymentUploadHandlerError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Payment upload is not available" };
  }

  if (fileBuffer.length <= 0) {
    return { status: 400, error: "File is empty" };
  }

  if (fileBuffer.length > PAYMENT_SCREENSHOT_MAX_BYTES) {
    return { status: 400, error: "File exceeds the maximum allowed size" };
  }

  const payment = await getPaymentForUploadAccess(paymentId, user);

  if (!payment) {
    return { status: 404, error: "Payment not found" };
  }

  const stateError = validatePaymentUploadState(payment);

  if (stateError) {
    return stateError;
  }

  const normalizedContentType = contentType.trim();

  if (
    normalizedContentType &&
    normalizedContentType !== "application/octet-stream" &&
    normalizedContentType !== payment.screenshotMimeType
  ) {
    return { status: 400, error: "File type does not match the selected file" };
  }

  try {
    await putStoredObject({
      key: payment.screenshotR2Key!,
      body: fileBuffer,
      contentType: payment.screenshotMimeType!,
    });
  } catch {
    return { status: 503, error: "Could not store uploaded screenshot" };
  }

  return { ok: true };
}
