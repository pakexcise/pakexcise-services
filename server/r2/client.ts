import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;

  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  return bucket;
}

export function getR2Client(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured");
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}
