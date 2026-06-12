import "server-only";

import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { isR2Configured } from "@/server/r2/client";
import type { R2ObjectHead } from "@/server/r2/object";

const STORAGE_ROOT = path.join(process.cwd(), ".local-uploads");

export function isLocalDevStorageEnabled(): boolean {
  return process.env.NODE_ENV === "development" && !isR2Configured();
}

function resolveStoragePath(key: string): string {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path.resolve(STORAGE_ROOT, normalized);

  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error("Invalid storage key");
  }

  return resolved;
}

export async function putLocalObject(input: {
  key: string;
  body: Buffer | Uint8Array;
}): Promise<void> {
  const filePath = resolveStoragePath(input.key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, input.body);
}

export async function headLocalObject(key: string): Promise<R2ObjectHead | null> {
  try {
    const fileStat = await stat(resolveStoragePath(key));

    return {
      contentLength: fileStat.size,
      contentType: null,
      etag: null,
    };
  } catch {
    return null;
  }
}

export async function readLocalObject(key: string): Promise<Buffer> {
  return readFile(resolveStoragePath(key));
}

export async function deleteLocalObject(key: string): Promise<void> {
  try {
    await unlink(resolveStoragePath(key));
  } catch {
    // Ignore missing files during cleanup.
  }
}
