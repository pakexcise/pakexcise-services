import "server-only";

import {
  buildPaymentMethodQrObjectKey,
  isPaymentMethodQrMimeType,
  validatePaymentMethodQrUpload,
} from "@/features/payment-methods/lib/payment-method-qr";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";
import { requirePermission } from "@/server/permissions/guards";
import {
  deleteStoredObject,
  isObjectStorageConfigured,
  putStoredObject,
} from "@/server/storage/object-storage";

export type PaymentMethodQrUploadError = {
  status: number;
  error: string;
};

export async function handleUploadPaymentMethodQrBytes(
  userId: string,
  paymentMethodId: string,
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ ok: true } | PaymentMethodQrUploadError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "File storage is not available" };
  }

  const normalizedContentType = contentType.trim();

  if (!isPaymentMethodQrMimeType(normalizedContentType)) {
    return { status: 400, error: "Only JPEG, PNG, or WebP QR images are allowed" };
  }

  const validation = validatePaymentMethodQrUpload({
    fileName,
    mimeType: normalizedContentType,
    fileSize: fileBuffer.length,
  });

  if (!validation.valid) {
    const message =
      validation.code === "FILE_TOO_LARGE"
        ? "QR image exceeds the maximum allowed size"
        : validation.code === "INVALID_MIME" ||
            validation.code === "MIME_MISMATCH" ||
            validation.code === "INVALID_EXTENSION"
          ? "Only JPEG, PNG, or WebP QR images are allowed"
          : "Invalid QR image file";

    return { status: 400, error: message };
  }

  const method = await adminPaymentMethodRepository.findById(paymentMethodId);

  if (!method) {
    return { status: 404, error: "Payment method not found" };
  }

  const nextKey = buildPaymentMethodQrObjectKey({
    paymentMethodId,
    mimeType: normalizedContentType,
  });

  await putStoredObject({
    key: nextKey,
    body: fileBuffer,
    contentType: normalizedContentType,
  });

  const previousKey = method.qrCodeR2Key;

  await prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: {
      qrCodeR2Key: nextKey,
      qrCodeMimeType: normalizedContentType,
    },
  });

  if (previousKey && previousKey !== nextKey) {
    await deleteStoredObject(previousKey).catch(() => undefined);
  }

  await auditAdminAction({
    actorId: userId,
    action: "UPDATE",
    entityType: "payment_method",
    entityId: paymentMethodId,
    after: {
      qrCodeR2Key: nextKey,
      qrCodeMimeType: normalizedContentType,
    },
  });

  return { ok: true };
}

export async function handleRemovePaymentMethodQr(
  userId: string,
  paymentMethodId: string,
): Promise<{ ok: true } | PaymentMethodQrUploadError> {
  const method = await adminPaymentMethodRepository.findById(paymentMethodId);

  if (!method) {
    return { status: 404, error: "Payment method not found" };
  }

  if (!method.qrCodeR2Key) {
    return { ok: true };
  }

  const previousKey = method.qrCodeR2Key;

  await prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: {
      qrCodeR2Key: null,
      qrCodeMimeType: null,
    },
  });

  await deleteStoredObject(previousKey).catch(() => undefined);

  await auditAdminAction({
    actorId: userId,
    action: "UPDATE",
    entityType: "payment_method",
    entityId: paymentMethodId,
    after: {
      qrCodeR2Key: null,
      qrCodeMimeType: null,
    },
  });

  return { ok: true };
}
