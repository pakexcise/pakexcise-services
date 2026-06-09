import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getR2BucketName, getR2Client } from "@/server/r2/client";

export async function putR2Object(input: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );
}
