import { DEFAULT_ACCEPTED_MIME_TYPES } from "@/config/uploads";
import { formatFileSize } from "@/features/applications/lib/validate-upload";
import type { ApplyDocumentRequirement } from "@/features/applications/types";

const MIME_TYPE_LABELS: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "application/pdf": "PDF",
};

function labelForMimeType(mimeType: string): string {
  return (
    MIME_TYPE_LABELS[mimeType] ??
    mimeType.split("/").pop()?.toUpperCase() ??
    mimeType
  );
}

export function formatSummaryMaxSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1 && Math.abs(megabytes - Math.round(megabytes)) < 0.05) {
    return `${Math.round(megabytes)} MB`;
  }

  return formatFileSize(bytes);
}

export function summarizeUploadConstraints(
  requirements: ApplyDocumentRequirement[],
): {
  acceptedTypeLabels: string;
  maxSizeBytes: number;
} {
  const mimeTypes = new Set<string>();
  let maxSizeBytes = 0;

  for (const requirement of requirements) {
    const acceptedTypes =
      requirement.acceptedMimeTypes.length > 0
        ? requirement.acceptedMimeTypes
        : [...DEFAULT_ACCEPTED_MIME_TYPES];

    for (const mimeType of acceptedTypes) {
      mimeTypes.add(mimeType);
    }

    maxSizeBytes = Math.max(maxSizeBytes, requirement.maxSizeBytes);
  }

  const acceptedTypeLabels = [...mimeTypes]
    .sort()
    .map(labelForMimeType)
    .join(", ");

  return {
    acceptedTypeLabels,
    maxSizeBytes,
  };
}
