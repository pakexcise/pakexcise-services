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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** R2 can be briefly inconsistent right after a PUT; retry before failing confirm. */
export async function headR2ObjectWithRetry(
  key: string,
  attempts = 4,
): Promise<R2ObjectHead | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const head = await headR2Object(key);

    if (head?.contentLength) {
      return head;
    }

    if (attempt < attempts - 1) {
      await wait(350 * (attempt + 1));
    }
  }

  return null;
}

export async function deleteR2Object(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
}
