import "server-only";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { getR2BucketName, getR2Client } from "@/server/r2/client";

export async function getR2Object(key: string): Promise<Buffer> {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );

  const body = response.Body;

  if (!body) {
    throw new Error("Object body is empty");
  }

  const bytes = await body.transformToByteArray();
  return Buffer.from(bytes);
}
