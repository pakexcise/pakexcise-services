import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MIME_TYPES,
  extensionFromMimeType,
  validateUploadFile,
} from "@/config/uploads";
import {
  putStoredObject,
  readStoredObject,
  isObjectStorageConfigured,
} from "@/server/storage/object-storage";

const BLOG_UPLOADS_DIR = path.join(process.cwd(), "storage", "blog-uploads");
const LEGACY_PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "blog", "uploads");

function slugifyBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "blog-image";
}

export function buildBlogImageStorageKey(fileName: string): string {
  return `blog/images/${fileName}`;
}

export function buildBlogImagePublicPath(fileName: string): string {
  return `/api/blog/images/${fileName}`;
}

export function extractBlogImageFileName(imagePath: string): string | null {
  const trimmed = imagePath.trim();

  if (trimmed.startsWith("/api/blog/images/")) {
    const fileName = trimmed.slice("/api/blog/images/".length);
    return isSafeBlogImageFileName(fileName) ? fileName : null;
  }

  if (trimmed.startsWith("/blog/uploads/")) {
    const fileName = trimmed.slice("/blog/uploads/".length);
    return isSafeBlogImageFileName(fileName) ? fileName : null;
  }

  return null;
}

export function isSafeBlogImageFileName(fileName: string): boolean {
  return /^[a-z0-9][a-z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

export type BlogImageUploadError = {
  status: number;
  error: string;
};

async function writePersistentBlogUpload(fileName: string, fileBuffer: Buffer) {
  await mkdir(BLOG_UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(BLOG_UPLOADS_DIR, fileName), fileBuffer);
}

export async function saveBlogPublicImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ ok: true; publicPath: string } | BlogImageUploadError> {
  const normalizedContentType = contentType.trim().toLowerCase();
  const validation = validateUploadFile({
    fileName,
    mimeType: normalizedContentType,
    fileSize: fileBuffer.length,
    maxSizeBytes: BLOG_IMAGE_MAX_BYTES,
    acceptedMimeTypes: BLOG_IMAGE_MIME_TYPES,
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
  const storageKey = buildBlogImageStorageKey(uniqueName);

  if (isObjectStorageConfigured()) {
    await putStoredObject({
      key: storageKey,
      body: fileBuffer,
      contentType: normalizedContentType,
    });
  }

  await writePersistentBlogUpload(uniqueName, fileBuffer);

  return {
    ok: true,
    publicPath: buildBlogImagePublicPath(uniqueName),
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

export async function readBlogImageContent(fileName: string): Promise<
  | { ok: true; body: Buffer; mimeType: string }
  | { ok: false; status: number; error: string }
> {
  if (!isSafeBlogImageFileName(fileName)) {
    return { ok: false, status: 400, error: "Invalid image name" };
  }

  const storageKey = buildBlogImageStorageKey(fileName);

  if (isObjectStorageConfigured()) {
    try {
      const body = await readStoredObject(storageKey);
      return {
        ok: true,
        body,
        mimeType: mimeTypeFromFileName(fileName),
      };
    } catch {
      // Fall through to filesystem locations.
    }
  }

  const persistentPath = path.join(BLOG_UPLOADS_DIR, fileName);
  const persistentBody = await readFromFilesystem(persistentPath);

  if (persistentBody) {
    return {
      ok: true,
      body: persistentBody,
      mimeType: mimeTypeFromFileName(fileName),
    };
  }

  const legacyPath = path.join(LEGACY_PUBLIC_UPLOADS_DIR, fileName);
  const legacyBody = await readFromFilesystem(legacyPath);

  if (legacyBody) {
    return {
      ok: true,
      body: legacyBody,
      mimeType: mimeTypeFromFileName(fileName),
    };
  }

  return { ok: false, status: 404, error: "Image not found" };
}
