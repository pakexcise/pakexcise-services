import "server-only";

import { PAYMENT_SCREENSHOT_MAX_BYTES } from "@/config/uploads";
import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import { roleHasPermission } from "@/server/permissions/roles";
import {
  isObjectStorageConfigured,
  putStoredObject,
} from "@/server/storage/object-storage";

export type CommissionProofUploadHandlerError = {
  status: number;
  error: string;
};

async function getCommissionForProofUpload(commissionId: string) {
  return prisma.agentCommission.findFirst({
    where: {
      id: commissionId,
      agentProfile: {
        user: {
          role: "AGENT",
          deletedAt: null,
        },
      },
    },
    select: {
      id: true,
      payoutStatus: true,
      proofR2Key: true,
      proofMimeType: true,
      proofFileSize: true,
    },
  });
}

export async function handleUploadCommissionProofBytes(
  user: CurrentUser,
  commissionId: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<{ ok: true } | CommissionProofUploadHandlerError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Commission proof upload is not available" };
  }

  if (!roleHasPermission(user.role, "agents:manage")) {
    return { status: 403, error: "Access denied" };
  }

  if (fileBuffer.length <= 0) {
    return { status: 400, error: "File is empty" };
  }

  if (fileBuffer.length > PAYMENT_SCREENSHOT_MAX_BYTES) {
    return { status: 400, error: "File exceeds the maximum allowed size" };
  }

  const commission = await getCommissionForProofUpload(commissionId);

  if (!commission) {
    return { status: 404, error: "Commission not found" };
  }

  if (commission.payoutStatus === "PAID") {
    return { status: 400, error: "Commission is already marked as paid" };
  }

  if (commission.payoutStatus === "CANCELLED") {
    return { status: 400, error: "Cancelled commissions cannot be paid" };
  }

  if (!commission.proofR2Key || !commission.proofMimeType) {
    return { status: 400, error: "Start upload before sending the file" };
  }

  const normalizedContentType = contentType.trim();

  if (
    normalizedContentType &&
    normalizedContentType !== "application/octet-stream" &&
    normalizedContentType !== commission.proofMimeType
  ) {
    return { status: 400, error: "File type does not match the selected file" };
  }

  if (commission.proofFileSize && fileBuffer.length > commission.proofFileSize) {
    return { status: 400, error: "File exceeds the declared size" };
  }

  try {
    await putStoredObject({
      key: commission.proofR2Key,
      body: fileBuffer,
      contentType: commission.proofMimeType,
    });
  } catch {
    return { status: 503, error: "Could not store uploaded proof" };
  }

  return { ok: true };
}
