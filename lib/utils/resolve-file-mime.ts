import { EXTENSION_TO_MIME, type AcceptedMimeType } from "@/config/uploads";

export function extensionFromFileName(fileName: string): string | null {
  const match = fileName.trim().toLowerCase().match(/\.([a-z0-9]+)$/i);
  return match?.[1] ?? null;
}

export function resolveMimeTypeFromFileName(
  fileName: string,
): AcceptedMimeType | null {
  const extension = extensionFromFileName(fileName);

  if (!extension) {
    return null;
  }

  return EXTENSION_TO_MIME[extension] ?? null;
}

export function resolveClientFileMimeType(
  file: File,
  acceptedMimeTypes: readonly string[],
): string | null {
  const trimmedType = file.type.trim();

  if (trimmedType && acceptedMimeTypes.includes(trimmedType)) {
    return trimmedType;
  }

  const inferred = resolveMimeTypeFromFileName(file.name);

  if (inferred && acceptedMimeTypes.includes(inferred)) {
    return inferred;
  }

  return trimmedType || inferred;
}
