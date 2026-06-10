import "server-only";

import { createHmac } from "node:crypto";

import { normalizeCnic } from "@/lib/validations/cnic";

function getHashKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY is not configured");
  }

  const buffer = Buffer.from(key, "base64");

  if (buffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes when base64 decoded");
  }

  return buffer;
}

export function hashCnic(cnicInput: string): string | null {
  const normalized = normalizeCnic(cnicInput);
  if (!normalized) {
    return null;
  }

  return createHmac("sha256", getHashKey()).update(normalized).digest("hex");
}
