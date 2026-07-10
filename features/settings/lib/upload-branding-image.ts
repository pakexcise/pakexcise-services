import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  BRANDING_IMAGE_MAX_BYTES,
  BRANDING_IMAGE_MIME_TYPES,
  extensionFromMimeType,
  validateUploadFile,
} from "@/config/uploads";
import {
  buildBrandingImagePublicPath,
  isSafeBrandingImageFileName,
} from "@/features/settings/lib/branding-image-paths";
import {
  isObjectStorageConfigured,
  putStoredObject,
  readStoredObject,
} from "@/server/storage/object-storage";

const BRANDING_UPLOADS_DIR = path.join(
  process.cwd(),
  "storage",
  "branding-uploads",
);

function slugifyBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "branding-image";
}

export function buildBrandingImageStorageKey(fileName: string): string {
  return `branding/images/${fileName}`;
}

export type BrandingImageUploadError = {
  status: number;
  error: string;
};

async function writePersistentBrandingUpload(
  fileName: string,
  fileBuffer: Buffer,
) {
  await mkdir(BRANDING_UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(BRANDING_UPLOADS_DIR, fileName), fileBuffer);
}

export async function saveBrandingPublicImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ ok: true; publicPath: string } | BrandingImageUploadError> {
  const normalizedContentType = contentType.trim().toLowerCase();
  const validation = validateUploadFile({
    fileName,
    mimeType: normalizedContentType,
    fileSize: fileBuffer.length,
    maxSizeBytes: BRANDING_IMAGE_MAX_BYTES,
    acceptedMimeTypes: BRANDING_IMAGE_MIME_TYPES,
  });

  if (!validation.valid) {
    const message =
      validation.code === "FILE_TOO_LARGE"
        ? "Image is too large (max 2 MB)"
        : "Invalid image file";
    return { status: 400, error: message };
  }

  const extension = extensionFromMimeType(normalizedContentType);
  const uniqueName = `${slugifyBaseName(fileName)}-${Date.now()}.${extension}`;
  const storageKey = buildBrandingImageStorageKey(uniqueName);

  if (isObjectStorageConfigured()) {
    await putStoredObject({
      key: storageKey,
      body: fileBuffer,
      contentType: normalizedContentType,
    });
  }

  await writePersistentBrandingUpload(uniqueName, fileBuffer);

  return {
    ok: true,
    publicPath: buildBrandingImagePublicPath(uniqueName),
  };
}

function mimeTypeFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function readFromFilesystem(filePath: string): Promise<Buffer | null> {
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export async function readBrandingImageContent(fileName: string): Promise<
  | { ok: true; body: Buffer; mimeType: string }
  | { ok: false; status: number; error: string }
> {
  if (!isSafeBrandingImageFileName(fileName)) {
    return { ok: false, status: 400, error: "Invalid image name" };
  }

  const storageKey = buildBrandingImageStorageKey(fileName);

  if (isObjectStorageConfigured()) {
    try {
      const body = await readStoredObject(storageKey);
      return {
        ok: true,
        body,
        mimeType: mimeTypeFromFileName(fileName),
      };
    } catch {
      // Fall through to filesystem.
    }
  }

  const persistentPath = path.join(BRANDING_UPLOADS_DIR, fileName);
  const persistentBody = await readFromFilesystem(persistentPath);

  if (persistentBody) {
    return {
      ok: true,
      body: persistentBody,
      mimeType: mimeTypeFromFileName(fileName),
    };
  }

  return { ok: false, status: 404, error: "Image not found" };
}

/** Sync filesystem read for PDF embedding (uploaded branding assets). */
export function readBrandingUploadFileSync(fileName: string): Buffer | null {
  if (!isSafeBrandingImageFileName(fileName)) {
    return null;
  }

  try {
    const filePath = path.join(BRANDING_UPLOADS_DIR, fileName);
    if (!existsSync(filePath)) {
      return null;
    }
    return readFileSync(filePath);
  } catch {
    return null;
  }
}
