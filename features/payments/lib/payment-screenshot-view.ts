import "server-only";

import { getPublicAppUrl } from "@/config/env.shared";
import { canViewPaymentScreenshot } from "@/features/payments/lib/payment-access";
import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import { createPresignedDownloadUrl } from "@/server/r2/presign-download";
import {
  isObjectStorageConfigured,
  readStoredObject,
  usesLocalDevStorage,
} from "@/server/storage/object-storage";

export type PaymentScreenshotViewError = {
  status: number;
  error: string;
};

export type PaymentScreenshotViewPayload = {
  signedUrl: string;
  expiresInSeconds: number;
  mimeType: string | null;
  fileName: string | null;
};

async function getPaymentForView(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      screenshotR2Key: true,
      screenshotFileName: true,
      screenshotMimeType: true,
      application: {
        select: {
          userId: true,
          agentId: true,
        },
      },
    },
  });
}

export async function handlePaymentScreenshotUrl(
  user: CurrentUser,
  paymentId: string,
): Promise<PaymentScreenshotViewPayload | PaymentScreenshotViewError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Payment screenshot viewing is not available" };
  }

  const payment = await getPaymentForView(paymentId);

  if (!payment?.screenshotR2Key) {
    return { status: 404, error: "Payment screenshot not found" };
  }

  if (!canViewPaymentScreenshot(user, payment.application)) {
    return { status: 403, error: "Access denied" };
  }

  if (usesLocalDevStorage()) {
    const appUrl = getPublicAppUrl();

    return {
      signedUrl: `${appUrl.replace(/\/$/, "")}/api/payments/${payment.id}/content`,
      expiresInSeconds: 60 * 60,
      mimeType: payment.screenshotMimeType,
      fileName: payment.screenshotFileName,
    };
  }

  try {
    const presigned = await createPresignedDownloadUrl({
      key: payment.screenshotR2Key,
      fileName: payment.screenshotFileName ?? "payment-screenshot",
      mimeType: payment.screenshotMimeType ?? "image/jpeg",
      purpose: "view",
    });

    return {
      signedUrl: presigned.signedUrl,
      expiresInSeconds: presigned.expiresInSeconds,
      mimeType: payment.screenshotMimeType,
      fileName: payment.screenshotFileName,
    };
  } catch {
    return { status: 503, error: "Could not create signed URL" };
  }
}

export async function handlePaymentScreenshotContent(
  user: CurrentUser,
  paymentId: string,
): Promise<
  | {
      body: Buffer;
      mimeType: string;
      fileName: string;
    }
  | PaymentScreenshotViewError
> {
  if (!usesLocalDevStorage()) {
    return { status: 404, error: "Direct payment screenshot content is not available" };
  }

  const payment = await getPaymentForView(paymentId);

  if (!payment?.screenshotR2Key) {
    return { status: 404, error: "Payment screenshot not found" };
  }

  if (!canViewPaymentScreenshot(user, payment.application)) {
    return { status: 403, error: "Access denied" };
  }

  try {
    const body = await readStoredObject(payment.screenshotR2Key);

    return {
      body,
      mimeType: payment.screenshotMimeType ?? "application/octet-stream",
      fileName: payment.screenshotFileName ?? "payment-screenshot",
    };
  } catch {
    return { status: 404, error: "Payment screenshot file was not found" };
  }
}
