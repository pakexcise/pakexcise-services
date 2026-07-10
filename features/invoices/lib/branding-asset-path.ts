import "server-only";

import fs from "node:fs";
import path from "node:path";

import { brandingAssets } from "@/config/branding";
import { extractBrandingImageFileName } from "@/features/settings/lib/branding-image-paths";
import { readBrandingUploadFileSync } from "@/features/settings/lib/upload-branding-image";

function detectImageMimeType(buffer: Buffer, filePath: string): string {
  if (buffer.length >= 4) {
    const signature = buffer.subarray(0, 4).toString("hex");

    if (signature.startsWith("ffd8ff")) {
      return "image/jpeg";
    }

    if (signature === "89504e47") {
      return "image/png";
    }

    if (buffer.subarray(0, 4).toString("ascii") === "RIFF") {
      return "image/webp";
    }
  }

  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  if (extension === ".svg") {
    return "image/svg+xml";
  }

  return "image/jpeg";
}

function resolvePublicAssetFilePath(assetPath: string): string | null {
  const trimmed = assetPath.trim();
  if (!trimmed || trimmed.startsWith("http")) {
    return null;
  }

  const relativePath = trimmed.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return filePath;
}

export function getBrandingAssetFilePath(
  asset: keyof typeof brandingAssets,
): string {
  const relativePath = brandingAssets[asset].replace(/^\//, "");
  return path.join(process.cwd(), "public", relativePath);
}

export function getBrandingAssetDataUriFromPath(assetPath: string): string | null {
  const uploadedFileName = extractBrandingImageFileName(assetPath);
  if (uploadedFileName) {
    const buffer = readBrandingUploadFileSync(uploadedFileName);
    if (!buffer) {
      return null;
    }

    const mimeType = detectImageMimeType(buffer, uploadedFileName);
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }

  const filePath = resolvePublicAssetFilePath(assetPath);
  if (!filePath) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  const mimeType = detectImageMimeType(buffer, filePath);

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export function getBrandingAssetDataUri(
  asset: keyof typeof brandingAssets,
): string {
  const filePath = getBrandingAssetFilePath(asset);
  const buffer = fs.readFileSync(filePath);
  const mimeType = detectImageMimeType(buffer, filePath);

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
