import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type ImageDimensions = {
  width: number;
  height: number;
};

function parsePngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24) {
    return null;
  }

  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function parseJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === undefined) {
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);

    if (segmentLength < 2 || offset + 2 + segmentLength > buffer.length) {
      break;
    }

    if (marker >= 0xc0 && marker <= 0xc3 && segmentLength >= 7) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

function parseWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 30) {
    return null;
  }

  const riff = buffer.toString("ascii", 0, 4);
  const webp = buffer.toString("ascii", 8, 12);

  if (riff !== "RIFF" || webp !== "WEBP") {
    return null;
  }

  const chunk = buffer.toString("ascii", 12, 16);

  if (chunk === "VP8X" && buffer.length >= 30) {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }

  if (chunk === "VP8 " && buffer.length >= 30) {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }

  if (chunk === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  return null;
}

function parseImageDimensions(buffer: Buffer): ImageDimensions | null {
  return (
    parsePngDimensions(buffer) ??
    parseJpegDimensions(buffer) ??
    parseWebpDimensions(buffer)
  );
}

export function isLocalPublicImagePath(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

export async function resolvePublicImageDimensions(
  src: string,
): Promise<ImageDimensions | null> {
  if (!isLocalPublicImagePath(src)) {
    return null;
  }

  try {
    const filePath = join(process.cwd(), "public", src.replace(/^\//, ""));
    const buffer = await readFile(filePath);
    return parseImageDimensions(buffer);
  } catch {
    return null;
  }
}

export function resolveDisplayImageDimensions(
  natural: ImageDimensions | null,
  maxDisplayWidth: number,
  fallback: ImageDimensions,
): ImageDimensions {
  if (!natural?.width || !natural.height) {
    return fallback;
  }

  if (natural.width <= maxDisplayWidth) {
    return natural;
  }

  const scale = maxDisplayWidth / natural.width;

  return {
    width: maxDisplayWidth,
    height: Math.max(1, Math.round(natural.height * scale)),
  };
}
