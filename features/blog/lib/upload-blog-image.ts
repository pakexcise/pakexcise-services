import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MIME_TYPES,
  extensionFromMimeType,
  validateUploadFile,
} from "@/config/uploads";

function slugifyBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "blog-image";
}

export type BlogImageUploadError = {
  status: number;
  error: string;
};

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
  const uploadDir = path.join(process.cwd(), "public", "blog", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, uniqueName), fileBuffer);

  return {
    ok: true,
    publicPath: `/blog/uploads/${uniqueName}`,
  };
}
