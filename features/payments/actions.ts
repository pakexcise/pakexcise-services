"use server";

import {
  buildPaymentScreenshotKey,
  PAYMENT_SCREENSHOT_MAX_BYTES,
  validateUploadFile,
} from "@/config/uploads";
import { canTransitionApplicationStatus } from "@/features/applications/status-machine";
import {
  confirmPaymentScreenshotSchema,
  rejectPaymentSchema,
  requestPaymentScreenshotSchema,
  verifyPaymentSchema,
} from "@/features/payments/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import {
  queuePaymentRejectedNotifications,
  queuePaymentUploadedNotifications,
} from "@/server/notifications/queue-payment-notification";
import { queueApplicationStatusNotifications } from "@/server/notifications/queue-application-status-notification";
import { requirePermission, requireUser } from "@/server/permissions/guards";
import { createPresignedUploadUrl } from "@/server/r2/presign-upload";
import { headR2Object } from "@/server/r2/object";
import { isR2Configured } from "@/server/r2/client";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

async function getOwnedPayment(paymentId: string, userId: string) {
  return prisma.payment.findFirst({
    where: {
      id: paymentId,
      application: { userId },
    },
    include: {
      application: {
        select: {
          id: true,
          status: true,
          trackingId: true,
          userId: true,
          locale: true,
          service: { select: { nameEn: true, nameUr: true } },
          user: { select: { email: true, phone: true } },
        },
      },
      invoice: { select: { status: true } },
    },
  });
}

export async function requestPaymentScreenshotUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    paymentId: string;
    uploadUrl: string;
    expiresInSeconds: number;
  }>
> {
  if (!isR2Configured()) {
    return errorResult("Payment upload is not available");
  }

  const user = await requireUser();
  await enforceRateLimit(serverActionRateLimit, `pay-upload:${user.id}`);

  const parsed = parseInput(requestPaymentScreenshotSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const payment = await getOwnedPayment(parsed.data.paymentId, user.id);

  if (!payment) {
    return errorResult("Payment not found");
  }

  if (payment.application.status !== "INVOICE_SENT") {
    return errorResult("Payment screenshot can only be uploaded after invoice is sent");
  }

  if (payment.status !== "PENDING" && payment.status !== "REJECTED") {
    return errorResult("Payment proof was already submitted");
  }

  const validation = validateUploadFile({
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    fileSize: parsed.data.fileSize,
    maxSizeBytes: PAYMENT_SCREENSHOT_MAX_BYTES,
  });

  if (!validation.valid) {
    return errorResult("Invalid payment screenshot file");
  }

  const r2Key = buildPaymentScreenshotKey({
    applicationId: payment.applicationId,
    paymentId: payment.id,
    extension: validation.extension,
  });

  try {
    const presigned = await createPresignedUploadUrl({
      key: r2Key,
      contentType: parsed.data.mimeType,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PENDING",
        screenshotR2Key: r2Key,
        screenshotFileName: parsed.data.fileName,
        screenshotMimeType: parsed.data.mimeType,
        screenshotFileSize: parsed.data.fileSize,
        rejectionReason: null,
        verifiedAt: null,
        verifiedById: null,
      },
    });

    return successResult({
      paymentId: payment.id,
      uploadUrl: presigned.uploadUrl,
      expiresInSeconds: presigned.expiresInSeconds,
    });
  } catch {
    return errorResult("Could not create upload URL");
  }
}

export async function confirmPaymentScreenshotUploadAction(
  input: unknown,
): Promise<ActionResult<{ paymentId: string; applicationStatus: string }>> {
  const user = await requireUser();

  const parsed = parseInput(confirmPaymentScreenshotSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const payment = await getOwnedPayment(parsed.data.paymentId, user.id);

  if (!payment || !payment.screenshotR2Key) {
    return errorResult("Payment upload not found");
  }

  const head = await headR2Object(payment.screenshotR2Key);

  if (!head?.contentLength) {
    return errorResult("Uploaded screenshot was not found in storage");
  }

  if (payment.application.status !== "INVOICE_SENT") {
    return errorResult("Invalid application status for payment upload");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "UPLOADED",
        screenshotFileSize: head.contentLength,
      },
    });

    await tx.application.update({
      where: { id: payment.applicationId },
      data: { status: "PAYMENT_UPLOADED" },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: payment.applicationId,
        fromStatus: "INVOICE_SENT",
        toStatus: "PAYMENT_UPLOADED",
        note: "Customer uploaded payment screenshot",
        actorId: user.id,
      },
    });
  });

  await queuePaymentUploadedNotifications({
    applicationId: payment.applicationId,
    userId: payment.application.userId,
    trackingId: payment.application.trackingId,
    serviceName: payment.application.service.nameEn,
    serviceNameUr: payment.application.service.nameUr,
    locale: payment.application.locale,
    userEmail: payment.application.user.email,
    userPhone: payment.application.user.phone,
  });

  return successResult({
    paymentId: payment.id,
    applicationStatus: "PAYMENT_UPLOADED",
  });
}

export async function verifyPaymentAction(
  input: unknown,
): Promise<ActionResult<{ paymentId: string; status: string }>> {
  const user = await requirePermission("payment:verify");
  const parsed = parseInput(verifyPaymentSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: {
      application: {
        select: {
          id: true,
          status: true,
          trackingId: true,
          userId: true,
          locale: true,
          service: { select: { nameEn: true, nameUr: true } },
          user: { select: { email: true, phone: true } },
        },
      },
    },
  });

  if (!payment) {
    return errorResult("Payment not found");
  }

  if (payment.status !== "UPLOADED") {
    return errorResult("Only uploaded payments can be verified");
  }

  if (!canTransitionApplicationStatus(payment.application.status, "PAYMENT_VERIFIED")) {
    return errorResult("Invalid application status transition");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "VERIFIED",
        verifiedById: user.id,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    });

    await tx.application.update({
      where: { id: payment.applicationId },
      data: { status: "PAYMENT_VERIFIED" },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: payment.applicationId,
        fromStatus: payment.application.status,
        toStatus: "PAYMENT_VERIFIED",
        note: parsed.data.note,
        actorId: user.id,
      },
    });
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "payment",
    entityId: payment.id,
    after: { status: "VERIFIED", applicationId: payment.applicationId },
  });

  await queueApplicationStatusNotifications({
    applicationId: payment.applicationId,
    userId: payment.application.userId,
    trackingId: payment.application.trackingId,
    serviceName: payment.application.service.nameEn,
    serviceNameUr: payment.application.service.nameUr,
    locale: payment.application.locale,
    toStatus: "PAYMENT_VERIFIED",
    note: parsed.data.note,
    userEmail: payment.application.user.email,
    userPhone: payment.application.user.phone,
  });

  return successResult({ paymentId: payment.id, status: "VERIFIED" });
}

export async function rejectPaymentAction(
  input: unknown,
): Promise<ActionResult<{ paymentId: string; status: string }>> {
  const user = await requirePermission("payment:verify");
  const parsed = parseInput(rejectPaymentSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: {
      application: {
        select: {
          id: true,
          status: true,
          trackingId: true,
          userId: true,
          locale: true,
          service: { select: { nameEn: true, nameUr: true } },
          user: { select: { email: true, phone: true } },
        },
      },
    },
  });

  if (!payment) {
    return errorResult("Payment not found");
  }

  if (payment.status !== "UPLOADED") {
    return errorResult("Only uploaded payments can be rejected");
  }

  if (!canTransitionApplicationStatus(payment.application.status, "INVOICE_SENT")) {
    return errorResult("Invalid application status transition");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "REJECTED",
        verifiedById: user.id,
        verifiedAt: new Date(),
        rejectionReason: parsed.data.reason,
      },
    });

    await tx.application.update({
      where: { id: payment.applicationId },
      data: { status: "INVOICE_SENT" },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: payment.applicationId,
        fromStatus: payment.application.status,
        toStatus: "INVOICE_SENT",
        note: `${parsed.data.note} — Rejection reason: ${parsed.data.reason}`,
        actorId: user.id,
      },
    });
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "payment",
    entityId: payment.id,
    after: {
      status: "REJECTED",
      reason: parsed.data.reason,
      applicationId: payment.applicationId,
    },
  });

  await queuePaymentRejectedNotifications({
    applicationId: payment.applicationId,
    userId: payment.application.userId,
    trackingId: payment.application.trackingId,
    serviceName: payment.application.service.nameEn,
    serviceNameUr: payment.application.service.nameUr,
    locale: payment.application.locale,
    reason: parsed.data.reason,
    userEmail: payment.application.user.email,
    userPhone: payment.application.user.phone,
  });

  return successResult({ paymentId: payment.id, status: "REJECTED" });
}
