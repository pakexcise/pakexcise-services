import "server-only";

import { isR2Configured } from "@/server/r2/client";
import { headR2ObjectWithRetry, type R2ObjectHead } from "@/server/r2/object";
import { putR2Object } from "@/server/r2/put-object";
import {
  deleteLocalObject,
  headLocalObject,
  isLocalDevStorageEnabled,
  putLocalObject,
  readLocalObject,
} from "@/server/storage/local-dev-storage";

export function isObjectStorageConfigured(): boolean {
  return isR2Configured() || isLocalDevStorageEnabled();
}

export function usesLocalDevStorage(): boolean {
  return isLocalDevStorageEnabled();
}

export async function putStoredObject(input: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<void> {
  if (isR2Configured()) {
    await putR2Object(input);
    return;
  }

  if (isLocalDevStorageEnabled()) {
    await putLocalObject({ key: input.key, body: input.body });
    return;
  }

  throw new Error("Object storage is not configured");
}

export async function headStoredObject(key: string): Promise<R2ObjectHead | null> {
  if (isR2Configured()) {
    const head = await headR2ObjectWithRetry(key);
    return head;
  }

  if (isLocalDevStorageEnabled()) {
    return headLocalObject(key);
  }

  return null;
}

export async function readStoredObject(key: string): Promise<Buffer> {
  if (isLocalDevStorageEnabled()) {
    return readLocalObject(key);
  }

  throw new Error("Direct object reads are only supported for local dev storage");
}

export async function deleteStoredObject(key: string): Promise<void> {
  if (isR2Configured()) {
    const { deleteR2Object } = await import("@/server/r2/object");
    await deleteR2Object(key);
    return;
  }

  if (isLocalDevStorageEnabled()) {
    await deleteLocalObject(key);
  }
}
