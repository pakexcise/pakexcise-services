"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { DocumentUpload } from "@/components/customer/DocumentUpload";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_ACCEPTED_MIME_TYPES } from "@/config/uploads";

type DocumentRequirement = {
  id: string;
  docType: string;
  labelEn: string;
  labelUr: string;
  instructionsEn: string | null;
  instructionsUr: string | null;
  isRequired: boolean;
  maxSizeBytes: number;
  acceptedMimeTypes: unknown;
};

type ApplicationDocument = {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  rejectionReason: string | null;
  requirementId: string | null;
};

type ApplicationDocumentsPanelProps = {
  applicationId: string;
  applicationStatus: string;
  locale: "en" | "ur";
  requirements: DocumentRequirement[];
  documents: ApplicationDocument[];
  labels: {
    title: string;
    empty: string;
    status: string;
    statusLabels: Record<string, string>;
    rejectionReason: string;
    uploadSection: string;
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
};

function parseAcceptedMimeTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [...DEFAULT_ACCEPTED_MIME_TYPES];
}

export function ApplicationDocumentsPanel({
  applicationId,
  applicationStatus,
  locale,
  requirements,
  documents,
  labels,
}: ApplicationDocumentsPanelProps) {
  const router = useRouter();

  const applicantDocuments = useMemo(
    () => documents.filter((doc) => doc.type !== "completion_proof"),
    [documents],
  );

  const documentsByRequirement = useMemo(() => {
    const map = new Map<string, ApplicationDocument>();

    for (const document of applicantDocuments) {
      if (document.requirementId) {
        map.set(document.requirementId, document);
      }
    }

    return map;
  }, [applicantDocuments]);

  const canUpload = applicationStatus === "DOCS_REQUIRED";

  function resolveDocumentStatusLabel(status: string): string {
    return labels.statusLabels[status] ?? status;
  }

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <h2 className="font-semibold">{labels.title}</h2>

      {applicantDocuments.length === 0 && requirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="space-y-4">
          {requirements.map((requirement) => {
            const document = documentsByRequirement.get(requirement.id);
            const label =
              locale === "ur" ? requirement.labelUr : requirement.labelEn;
            const instructions =
              locale === "ur"
                ? requirement.instructionsUr
                : requirement.instructionsEn;

            return (
              <div key={requirement.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{label}</p>
                  {document ? (
                    <Badge variant="outline">
                      {resolveDocumentStatusLabel(document.status)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {requirement.isRequired ? labels.required : labels.optional}
                    </Badge>
                  )}
                </div>

                {document ? (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {labels.status}: {resolveDocumentStatusLabel(document.status)} —{" "}
                      {document.fileName}
                    </p>
                    {document.rejectionReason ? (
                      <p className="mt-1 text-destructive">
                        {labels.rejectionReason}: {document.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {canUpload ? (
                  <DocumentUpload
                    applicationId={applicationId}
                    requirementId={requirement.id}
                    docType={requirement.docType}
                    label={label}
                    instructions={instructions}
                    isRequired={requirement.isRequired}
                    maxSizeBytes={requirement.maxSizeBytes}
                    acceptedMimeTypes={parseAcceptedMimeTypes(
                      requirement.acceptedMimeTypes,
                    )}
                    uploaded={
                      document
                        ? {
                            documentId: document.id,
                            docType: document.type,
                            fileName: document.fileName,
                            mimeType: document.mimeType,
                            fileSize: document.fileSize,
                            requirementId: document.requirementId,
                          }
                        : null
                    }
                    labels={{
                      required: labels.required,
                      optional: labels.optional,
                      upload: labels.upload,
                      uploading: labels.uploading,
                      replace: labels.replace,
                      remove: labels.remove,
                      maxSize: labels.maxSize,
                      allowedTypes: labels.allowedTypes,
                      uploadFailed: labels.uploadFailed,
                      invalidType: labels.invalidType,
                      tooLarge: labels.tooLarge,
                      invalidName: labels.invalidName,
                    }}
                    onUploaded={() => router.refresh()}
                  />
                ) : null}
              </div>
            );
          })}

          {requirements.length === 0
            ? applicantDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <span>{document.fileName}</span>
                  <Badge variant="outline">
                    {resolveDocumentStatusLabel(document.status)}
                  </Badge>
                </div>
              ))
            : null}
        </div>
      )}

      {canUpload ? (
        <p className="text-xs text-muted-foreground">{labels.uploadSection}</p>
      ) : null}
    </div>
  );
}
