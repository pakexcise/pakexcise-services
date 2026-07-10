const BLOG_IMAGE_API_PREFIX = "/api/blog/images/";
const BLOG_IMAGE_LEGACY_PREFIX = "/blog/uploads/";

export type BlogImageDimensions = {
  width: number;
  height: number;
};

export function isLocalPublicImagePath(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/api/");
}

export function isSafeBlogImageFileName(fileName: string): boolean {
  return /^[a-z0-9][a-z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

export function buildBlogImagePublicPath(fileName: string): string {
  return `${BLOG_IMAGE_API_PREFIX}${fileName}`;
}

export function extractBlogImageFileName(imagePath: string): string | null {
  const trimmed = imagePath.trim();

  if (trimmed.startsWith(BLOG_IMAGE_API_PREFIX)) {
    const fileName = trimmed.slice(BLOG_IMAGE_API_PREFIX.length);
    return isSafeBlogImageFileName(fileName) ? fileName : null;
  }

  if (trimmed.startsWith(BLOG_IMAGE_LEGACY_PREFIX)) {
    const fileName = trimmed.slice(BLOG_IMAGE_LEGACY_PREFIX.length);
    return isSafeBlogImageFileName(fileName) ? fileName : null;
  }

  return null;
}

/** Normalize stored blog image paths to a reliable same-origin serve URL. */
export function resolveBlogImageSrc(path: string | null | undefined): string | null {
  const trimmed = path?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith(BLOG_IMAGE_API_PREFIX)) {
    const fileName = trimmed.slice(BLOG_IMAGE_API_PREFIX.length);
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
    trimmed.startsWith(BLOG_IMAGE_API_PREFIX) ||
    trimmed.startsWith(BLOG_IMAGE_LEGACY_PREFIX)
  );
}
