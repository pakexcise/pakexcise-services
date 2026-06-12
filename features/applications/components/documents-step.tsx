"use client";

import { Button } from "@/components/ui/button";
import { DocumentUploadItem } from "@/features/applications/components/document-upload-item";
import type {
  ApplyDocumentRequirement,
  SavedDocumentMeta,
} from "@/features/applications/types";

type DocumentsStepProps = {
  applicationId: string;
  requirements: ApplyDocumentRequirement[];
  documents: Record<string, SavedDocumentMeta>;
  labels: {
    title: string;
    description: string;
    empty: string;
    back: string;
    continue: string;
    saving: string;
    missingRequired: string;
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
    previewLoading: string;
    previewError: string;
    previewOpen: string;
  };
  isSaving: boolean;
  validationError: string | null;
  onBack: () => void;
  onDocumentUploaded: (requirementId: string, document: SavedDocumentMeta) => void;
  onDocumentRemoved: (requirementId: string) => void;
  onSubmit: () => Promise<void>;
};

export function DocumentsStep({
  applicationId,
  requirements,
  documents,
  labels,
  isSaving,
  validationError,
  onBack,
  onDocumentUploaded,
  onDocumentRemoved,
  onSubmit,
}: DocumentsStepProps) {
  if (requirements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{labels.title}</h2>
          <p className="text-sm text-muted-foreground">{labels.description}</p>
        </div>
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {labels.empty}
        </p>
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            {labels.back}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? labels.saving : labels.continue}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      <div className="space-y-4">
        {requirements.map((requirement) => (
          <DocumentUploadItem
            key={requirement.id}
            applicationId={applicationId}
            requirement={requirement}
            uploaded={documents[requirement.id]}
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
              previewLoading: labels.previewLoading,
              previewError: labels.previewError,
              previewOpen: labels.previewOpen,
            }}
            onUploaded={(document) =>
              onDocumentUploaded(requirement.id, document)
            }
            onRemoved={() => onDocumentRemoved(requirement.id)}
          />
        ))}
      </div>

      {validationError ? (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {labels.back}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSaving}>
          {isSaving ? labels.saving : labels.continue}
        </Button>
      </div>
    </div>
  );
}
