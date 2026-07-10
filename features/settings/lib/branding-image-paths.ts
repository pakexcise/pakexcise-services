const BRANDING_IMAGE_API_PREFIX = "/api/branding/images/";

export function isSafeBrandingImageFileName(fileName: string): boolean {
  return /^[a-z0-9][a-z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(fileName);
}

export function buildBrandingImagePublicPath(fileName: string): string {
  return `${BRANDING_IMAGE_API_PREFIX}${fileName}`;
}

export function extractBrandingImageFileName(
  imagePath: string,
): string | null {
  const trimmed = imagePath.trim();

  if (!trimmed.startsWith(BRANDING_IMAGE_API_PREFIX)) {
    return null;
  }

  const fileName = trimmed.slice(BRANDING_IMAGE_API_PREFIX.length);
  return isSafeBrandingImageFileName(fileName) ? fileName : null;
}

/** Normalize stored branding image paths for preview and public use. */
export function resolveBrandingImageSrc(
  path: string | null | undefined,
): string | null {
  const trimmed = path?.trim();
  if (!trimmed) {
    return null;
  }

  const uploadedFileName = extractBrandingImageFileName(trimmed);
  if (uploadedFileName) {
    return buildBrandingImagePublicPath(uploadedFileName);
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return null;
}

export function isUploadedBrandingImagePath(
  path: string | null | undefined,
): boolean {
  return extractBrandingImageFileName(path ?? "") !== null;
}
