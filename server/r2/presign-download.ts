import "server-only";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  DOCUMENT_VIEW_EXPIRY_SECONDS,
  INVOICE_DOWNLOAD_EXPIRY_SECONDS,
  PROOF_DOWNLOAD_EXPIRY_SECONDS,
} from "@/config/uploads";
import { getR2BucketName, getR2Client } from "@/server/r2/client";

export type SignedDownloadPurpose = "view" | "proof" | "invoice";

export type PresignedDownloadInput = {
  key: string;
  fileName: string;
  mimeType: string;
  purpose: SignedDownloadPurpose;
  expiresInSeconds?: number;
};

export type PresignedDownloadResult = {
  signedUrl: string;
  expiresInSeconds: number;
};

export function resolveDownloadExpirySeconds(
  purpose: SignedDownloadPurpose,
  override?: number,
): number {
  if (override) {
    return override;
  }

  if (purpose === "proof") {
    return PROOF_DOWNLOAD_EXPIRY_SECONDS;
  }

  if (purpose === "invoice") {
    return INVOICE_DOWNLOAD_EXPIRY_SECONDS;
  }

  return DOCUMENT_VIEW_EXPIRY_SECONDS;
}

export async function createPresignedDownloadUrl(
  input: PresignedDownloadInput,
): Promise<PresignedDownloadResult> {
  const expiresInSeconds = resolveDownloadExpirySeconds(
    input.purpose,
    input.expiresInSeconds,
  );

  const disposition =
    input.purpose === "view"
      ? `inline; filename="${sanitizeContentDispositionFileName(input.fileName)}"`
      : `attachment; filename="${sanitizeContentDispositionFileName(input.fileName)}"`;

  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: input.key,
    ResponseContentType: input.mimeType,
    ResponseContentDisposition: disposition,
  });

  const signedUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: expiresInSeconds,
  });

  return {
    signedUrl,
    expiresInSeconds,
  };
}

function sanitizeContentDispositionFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-() ]+/g, "_").slice(0, 180);
}
