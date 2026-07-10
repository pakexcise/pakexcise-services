import {
  buildBlogImagePublicPath,
  extractBlogImageFileName,
  isSafeBlogImageFileName,
} from "@/features/blog/lib/upload-blog-image";

/** Normalize stored blog image paths to a reliable same-origin serve URL. */
export function resolveBlogImageSrc(path: string | null | undefined): string | null {
  const trimmed = path?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/api/blog/images/")) {
    const fileName = trimmed.slice("/api/blog/images/".length);
    return isSafeBlogImageFileName(fileName) ? trimmed : null;
  }

  const uploadedFileName = extractBlogImageFileName(trimmed);
  if (uploadedFileName) {
    return buildBlogImagePublicPath(uploadedFileName);
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return null;
}

export function isUploadedBlogImagePath(path: string | null | undefined): boolean {
  const trimmed = path?.trim();
  if (!trimmed) {
    return false;
  }

  return (
    trimmed.startsWith("/api/blog/images/") || trimmed.startsWith("/blog/uploads/")
  );
}
