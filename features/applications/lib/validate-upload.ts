import { EXTENSION_TO_MIME, hasDoubleExtension } from "@/config/uploads";

export type UploadValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateClientUpload(input: {
  file: File;
  acceptedMimeTypes: string[];
  maxSizeBytes: number;
  invalidTypeMessage: string;
  tooLargeMessage: string;
  invalidNameMessage: string;
}): UploadValidationResult {
  const fileName = input.file.name.trim();

  if (!fileName || fileName.includes("..")) {
    return { valid: false, error: input.invalidNameMessage };
  }

  if (hasDoubleExtension(fileName)) {
    return { valid: false, error: input.invalidNameMessage };
  }

  const extensionMatch = fileName.toLowerCase().match(/\.([a-z0-9]+)$/i);
  const extension = extensionMatch?.[1];

  if (!extension || !EXTENSION_TO_MIME[extension]) {
    return { valid: false, error: input.invalidTypeMessage };
  }

  if (EXTENSION_TO_MIME[extension] !== input.file.type) {
    return { valid: false, error: input.invalidTypeMessage };
  }

  if (!input.acceptedMimeTypes.includes(input.file.type)) {
    return { valid: false, error: input.invalidTypeMessage };
  }

  if (input.file.size > input.maxSizeBytes) {
    return { valid: false, error: input.tooLargeMessage };
  }

  if (input.file.size <= 0) {
    return { valid: false, error: input.invalidTypeMessage };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
