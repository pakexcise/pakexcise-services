import "server-only";

import { PAYMENT_SCREENSHOT_MAX_BYTES } from "@/config/uploads";
import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import {
  isObjectStorageConfigured,
  putStoredObject,
} from "@/server/storage/object-storage";

export type PaymentUploadHandlerError = {
  status: number;
  error: string;
};

async function getOwnedPayment(paymentId: string, userId: string) {
  return prisma.payment.findFirst({
    where: {
      id: paymentId,
      application: { userId },
    },
    select: {
      id: true,
      applicationId: true,
      status: true,
      screenshotR2Key: true,
      screenshotMimeType: true,
      screenshotFileSize: true,
      application: {
        select: {
          status: true,
        },
      },
    },
  });
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

  const payment = await getOwnedPayment(paymentId, user.id);

  if (!payment) {
    return { status: 404, error: "Payment not found" };
  }

  if (payment.application.status !== "INVOICE_SENT") {
    return {
      status: 400,
      error: "Payment screenshot can only be uploaded after invoice is sent",
    };
  }

  if (payment.status !== "PENDING" && payment.status !== "REJECTED") {
    return { status: 400, error: "Payment proof was already submitted" };
  }

  if (!payment.screenshotR2Key || !payment.screenshotMimeType) {
    return { status: 400, error: "Start upload before sending the file" };
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
      key: payment.screenshotR2Key,
      body: fileBuffer,
      contentType: payment.screenshotMimeType,
    });
  } catch {
    return { status: 503, error: "Could not store uploaded screenshot" };
  }

  return { ok: true };
}
