"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ExternalLink, FileUp, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FILE_PREVIEW_IMAGE_CLASS,
  FILE_PREVIEW_PDF_CLASS,
  FilePreviewFrame,
} from "@/components/shared/file-preview-frame";
import {
  confirmDocumentUploadAction,
  getDocumentSignedUrlAction,
  requestPresignedUploadAction,
} from "@/features/documents/actions";
import {
  formatFileSize,
  validateClientUpload,
} from "@/features/applications/lib/validate-upload";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";

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
  showFileConstraints?: boolean;
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
    previewLoading?: string;
    previewError?: string;
    previewOpen?: string;
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

type PreviewLabels = {
  previewLoading: string;
  previewError: string;
  previewOpen: string;
};

function DocumentPreview({
  documentId,
  mimeType,
  fileName,
  labels,
}: {
  documentId: string;
  mimeType: string;
  fileName: string;
  labels: PreviewLabels;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      setError(null);

      const result = await getDocumentSignedUrlAction({
        documentId,
        purpose: "view",
      });

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(labels.previewError);
        setPreviewUrl(null);
        setLoading(false);
        return;
      }

      setPreviewUrl(result.data.signedUrl);
      setLoading(false);
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [documentId, fileName, labels.previewError]);

  if (loading) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">{labels.previewLoading}</p>
    );
  }

  if (error || !previewUrl) {
    return null;
  }

  if (mimeType.startsWith("image/")) {
    return (
      <div className="mt-3">
        <FilePreviewFrame>
          {/* Signed R2 URLs are short-lived; use native img for private previews. */}
          <img
            key={`${documentId}:${fileName}`}
            src={previewUrl}
            alt={fileName}
            className={FILE_PREVIEW_IMAGE_CLASS}
          />
        </FilePreviewFrame>
      </div>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <div className="mt-3 space-y-2">
        <iframe
          key={`${documentId}:${fileName}`}
          src={previewUrl}
          title={fileName}
          className={FILE_PREVIEW_PDF_CLASS}
        />
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="size-3" aria-hidden="true" />
          {labels.previewOpen}
        </a>
      </div>
    );
  }

  return (
    <a
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <ExternalLink className="size-3" aria-hidden="true" />
      {labels.previewOpen}
    </a>
  );
}

const defaultPreviewLabels = {
  previewLoading: "Loading preview...",
  previewError: "Preview could not be loaded.",
  previewOpen: "Open document in new tab",
};

export function DocumentUpload({
  applicationId,
  requirementId,
  docType,
  label,
  instructions,
  isRequired = true,
  maxSizeBytes,
  acceptedMimeTypes,
  showFileConstraints = true,
  uploaded,
  labels,
  onUploaded,
  onRemoved,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const previewLabels = {
    previewLoading:
      labels.previewLoading ?? defaultPreviewLabels.previewLoading,
    previewError: labels.previewError ?? defaultPreviewLabels.previewError,
    previewOpen: labels.previewOpen ?? defaultPreviewLabels.previewOpen,
  };

  useEffect(() => {
    if (uploaded) {
      setError(null);
    }
  }, [uploaded]);

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

    const resolvedMimeType = resolveClientFileMimeType(file, acceptedMimeTypes);

    if (!resolvedMimeType) {
      setError(labels.invalidType);
      return;
    }

    setError(null);

    startTransition(async () => {
      const requestResult = await requestPresignedUploadAction({
        applicationId,
        requirementId,
        docType,
        fileName: file.name,
        mimeType: resolvedMimeType,
        fileSize: file.size,
      });

      if (!requestResult.success) {
        setError(requestResult.error ?? labels.uploadFailed);
        return;
      }

      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file, file.name);

        const uploadResponse = await fetch(
          `/api/documents/${requestResult.data.documentId}/upload`,
          {
            method: "POST",
            body: uploadFormData,
            credentials: "include",
          },
        );

        if (!uploadResponse.ok) {
          const payload = (await uploadResponse.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(payload?.error ?? labels.uploadFailed);
          return;
        }

        const checksum = await computeSha256Checksum(file);

        const confirmResult = await confirmDocumentUploadAction({
          documentId: requestResult.data.documentId,
          applicationId,
          checksum,
        });

        if (!confirmResult.success) {
          setError(confirmResult.error ?? labels.uploadFailed);
          return;
        }

        setError(null);

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
          {showFileConstraints ? (
            <>
              <p className="text-xs text-muted-foreground">
                {labels.maxSize.replace("__SIZE__", formatFileSize(maxSizeBytes))}
              </p>
              <p className="text-xs text-muted-foreground">{labels.allowedTypes}</p>
            </>
          ) : null}
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
                onClick={() => {
                  setError(null);
                  onRemoved();
                }}
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

      {uploaded ? (
        <DocumentPreview
          documentId={uploaded.documentId}
          mimeType={uploaded.mimeType}
          fileName={uploaded.fileName}
          labels={previewLabels}
        />
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
