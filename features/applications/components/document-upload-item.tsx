"use client";

import { DocumentUpload } from "@/components/customer/DocumentUpload";
import { trackApplicationEvent } from "@/features/applications/lib/analytics";
import type {
  ApplyDocumentRequirement,
  SavedDocumentMeta,
} from "@/features/applications/types";

type DocumentUploadItemProps = {
  applicationId: string;
  requirement: ApplyDocumentRequirement;
  uploaded?: SavedDocumentMeta;
  labels: {
    required: string;
    optional: string;
    upload: string;
    uploading: string;
    replace: string;
    remove: string;
    maxSize: string;
    allowedTypes: string;
    uploadFailed: string;
    invalidType: string;
    tooLarge: string;
    invalidName: string;
  };
  onUploaded: (document: SavedDocumentMeta) => void;
  onRemoved: () => void;
};

export function DocumentUploadItem({
  applicationId,
  requirement,
  uploaded,
  labels,
  onUploaded,
  onRemoved,
}: DocumentUploadItemProps) {
  const acceptedTypes =
    requirement.acceptedMimeTypes.length > 0
      ? requirement.acceptedMimeTypes
      : ["image/jpeg", "image/png", "image/webp", "application/pdf"];

  return (
    <DocumentUpload
      applicationId={applicationId}
      requirementId={requirement.id}
      docType={requirement.docType}
      label={requirement.label}
      instructions={requirement.instructions}
      isRequired={requirement.isRequired}
      maxSizeBytes={requirement.maxSizeBytes}
      acceptedMimeTypes={acceptedTypes}
      uploaded={uploaded}
      labels={labels}
      onUploaded={(document) => {
        trackApplicationEvent("upload_document", {
          doc_type: requirement.docType,
          mime_type: document.mimeType,
          file_size_kb: Math.round(document.fileSize / 1024),
        });

        onUploaded({
          documentId: document.documentId,
          docType: document.docType,
          fileName: document.fileName,
          mimeType: document.mimeType,
          fileSize: document.fileSize,
          requirementId: requirement.id,
        });
      }}
      onRemoved={onRemoved}
    />
  );
}
