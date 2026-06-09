import "server-only";

import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

import { getR2BucketName, getR2Client } from "@/server/r2/client";

export type R2ObjectHead = {
  contentLength: number | null;
  contentType: string | null;
  etag: string | null;
};

export async function headR2Object(key: string): Promise<R2ObjectHead | null> {
  try {
    const response = await getR2Client().send(
      new HeadObjectCommand({
        Bucket: getR2BucketName(),
        Key: key,
      }),
    );

    return {
      contentLength: response.ContentLength ?? null,
      contentType: response.ContentType ?? null,
      etag: response.ETag?.replace(/"/g, "") ?? null,
    };
  } catch {
    return null;
  }
}

export async function deleteR2Object(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
}
