"use client";

import { useRef, useState, useTransition } from "react";
import { FileUp, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  confirmDocumentUploadAction,
  requestPresignedUploadAction,
} from "@/features/documents/actions";
import {
  formatFileSize,
  validateClientUpload,
} from "@/features/applications/lib/validate-upload";

export type UploadedDocumentMeta = {
  documentId: string;
  docType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  requirementId?: string | null;
};

type DocumentUploadProps = {
  applicationId: string;
  requirementId?: string;
  docType: string;
  label: string;
  instructions?: string | null;
  isRequired?: boolean;
  maxSizeBytes: number;
  acceptedMimeTypes: string[];
  uploaded?: UploadedDocumentMeta | null;
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
  onUploaded: (document: UploadedDocumentMeta) => void;
  onRemoved?: () => void;
};

async function computeSha256Checksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function DocumentUpload({
  applicationId,
  requirementId,
  docType,
  label,
  instructions,
  isRequired = true,
  maxSizeBytes,
  acceptedMimeTypes,
  uploaded,
  labels,
  onUploaded,
  onRemoved,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePickFile() {
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validation = validateClientUpload({
      file,
      acceptedMimeTypes,
      maxSizeBytes,
      invalidTypeMessage: labels.invalidType,
      tooLargeMessage: labels.tooLarge,
      invalidNameMessage: labels.invalidName,
    });

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);

    startTransition(async () => {
      const requestResult = await requestPresignedUploadAction({
        applicationId,
        requirementId,
        docType,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      if (!requestResult.success) {
        setError(requestResult.error ?? labels.uploadFailed);
        return;
      }

      try {
        const uploadResponse = await fetch(requestResult.data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          setError(labels.uploadFailed);
          return;
        }

        const checksum = await computeSha256Checksum(file);

        const confirmResult = await confirmDocumentUploadAction({
          documentId: requestResult.data.documentId,
          checksum,
        });

        if (!confirmResult.success) {
          setError(confirmResult.error ?? labels.uploadFailed);
          return;
        }

        onUploaded({
          documentId: confirmResult.data.documentId,
          docType: confirmResult.data.docType,
          fileName: confirmResult.data.fileName,
          mimeType: confirmResult.data.mimeType,
          fileSize: confirmResult.data.fileSize,
          requirementId: confirmResult.data.requirementId,
        });
      } catch {
        setError(labels.uploadFailed);
      }
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{label}</h3>
            <Badge variant={isRequired ? "default" : "secondary"}>
              {isRequired ? labels.required : labels.optional}
            </Badge>
          </div>
          {instructions ? (
            <p className="text-sm text-muted-foreground">{instructions}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {labels.maxSize.replace("__SIZE__", formatFileSize(maxSizeBytes))}
          </p>
          <p className="text-xs text-muted-foreground">{labels.allowedTypes}</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedMimeTypes.join(",")}
          onChange={handleFileChange}
        />

        {uploaded ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {uploaded.fileName} ({formatFileSize(uploaded.fileSize)})
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handlePickFile}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                labels.replace
              )}
            </Button>
            {onRemoved ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onRemoved}
                disabled={isPending}
              >
                <X className="size-4" />
                <span className="sr-only">{labels.remove}</span>
              </Button>
            ) : null}
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handlePickFile}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {labels.uploading}
              </>
            ) : (
              <>
                <FileUp className="size-4" />
                {labels.upload}
              </>
            )}
          </Button>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
