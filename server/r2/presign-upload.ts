import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { UPLOAD_URL_EXPIRY_SECONDS } from "@/config/uploads";
import { getR2BucketName, getR2Client } from "@/server/r2/client";

export type PresignedUploadInput = {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
};

export type PresignedUploadResult = {
  uploadUrl: string;
  expiresInSeconds: number;
};

export async function createPresignedUploadUrl(
  input: PresignedUploadInput,
): Promise<PresignedUploadResult> {
  const expiresInSeconds = input.expiresInSeconds ?? UPLOAD_URL_EXPIRY_SECONDS;

  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: input.key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    expiresInSeconds,
  };
}
