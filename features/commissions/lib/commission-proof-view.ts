import "server-only";

import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import { createPresignedDownloadUrl } from "@/server/r2/presign-download";
import {
  isObjectStorageConfigured,
  readStoredObject,
  usesLocalDevStorage,
} from "@/server/storage/object-storage";

export type CommissionProofViewError = {
  status: number;
  error: string;
};

export type CommissionProofViewPayload = {
  signedUrl: string;
  expiresInSeconds: number;
  mimeType: string | null;
  fileName: string | null;
};

function canViewCommissionProof(
  user: CurrentUser,
  commission: {
    agentProfile: { userId: string };
    payoutStatus: string;
    proofR2Key: string | null;
  },
): boolean {
  if (!commission.proofR2Key) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return (
      commission.payoutStatus === "PAID" ||
      commission.payoutStatus === "PROCESSING"
    );
  }

  if (user.role === "AGENT" && user.agentProfile) {
    return (
      commission.payoutStatus === "PAID" &&
      commission.agentProfile.userId === user.id
    );
  }

  return false;
}

async function getCommissionForProofView(commissionId: string) {
  return prisma.agentCommission.findUnique({
    where: { id: commissionId },
    select: {
      id: true,
      proofR2Key: true,
      proofMimeType: true,
      proofFileName: true,
      payoutStatus: true,
      agentProfile: {
        select: {
          userId: true,
        },
      },
    },
  });
}

export async function handleCommissionProofUrl(
  user: CurrentUser,
  commissionId: string,
): Promise<CommissionProofViewPayload | CommissionProofViewError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Commission proof viewing is not available" };
  }

  const commission = await getCommissionForProofView(commissionId);

  if (!commission?.proofR2Key) {
    return { status: 404, error: "Commission proof not found" };
  }

  if (!canViewCommissionProof(user, commission)) {
    return { status: 403, error: "Access denied" };
  }

  if (usesLocalDevStorage()) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return {
      signedUrl: `${appUrl.replace(/\/$/, "")}/api/commissions/${commission.id}/content`,
      expiresInSeconds: 60 * 60,
      mimeType: commission.proofMimeType,
      fileName: commission.proofFileName,
    };
  }

  try {
    const presigned = await createPresignedDownloadUrl({
      key: commission.proofR2Key,
      fileName: commission.proofFileName ?? "commission-proof",
      mimeType: commission.proofMimeType ?? "image/jpeg",
      purpose: "view",
    });

    return {
      signedUrl: presigned.signedUrl,
      expiresInSeconds: presigned.expiresInSeconds,
      mimeType: commission.proofMimeType,
      fileName: commission.proofFileName,
    };
  } catch {
    return { status: 503, error: "Could not create signed URL" };
  }
}

export async function handleCommissionProofContent(
  user: CurrentUser,
  commissionId: string,
): Promise<
  | {
      body: Buffer;
      mimeType: string;
      fileName: string;
    }
  | CommissionProofViewError
> {
  if (!usesLocalDevStorage()) {
    return { status: 404, error: "Direct commission proof content is not available" };
  }

  const commission = await getCommissionForProofView(commissionId);

  if (!commission?.proofR2Key) {
    return { status: 404, error: "Commission proof not found" };
  }

  if (!canViewCommissionProof(user, commission)) {
    return { status: 403, error: "Access denied" };
  }

  try {
    const body = await readStoredObject(commission.proofR2Key);

    return {
      body,
      mimeType: commission.proofMimeType ?? "application/octet-stream",
      fileName: commission.proofFileName ?? "commission-proof",
    };
  } catch {
    return { status: 404, error: "Commission proof file was not found" };
  }
}
