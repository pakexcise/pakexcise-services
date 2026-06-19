import "server-only";

const PLATE_IMAGE_MIME_TYPES = new Set([  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const PLATE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export function isPlateFormatImageMimeType(mimeType: string): boolean {
  return PLATE_IMAGE_MIME_TYPES.has(mimeType.trim().toLowerCase());
}

export function validatePlateFormatImageUpload(input: {
  fileName: string;
  mimeType: string;
  fileSize: number;
}): { valid: true } | { valid: false; error: string } {
  if (!isPlateFormatImageMimeType(input.mimeType)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, or AVIF images are allowed",
    };
  }

  if (input.fileSize <= 0 || input.fileSize > PLATE_IMAGE_MAX_BYTES) {
    return {
      valid: false,
      error: "Image exceeds the maximum allowed size (2 MB)",
    };
  }

  const extension = input.fileName.split(".").pop()?.toLowerCase() ?? "";
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

  if (!allowedExtensions.has(extension)) {
    return {
      valid: false,
      error: "Invalid image file extension",
    };
  }

  return { valid: true };
}

export function buildPlateFormatImageObjectKey(input: {
  formatId: string;
  mimeType: string;
}): string {
  const extension =
    input.mimeType === "image/png"
      ? "png"
      : input.mimeType === "image/webp"
        ? "webp"
        : input.mimeType === "image/avif"
          ? "avif"
          : "jpg";

  return `marketing/region-plates/${input.formatId}.${extension}`;
}