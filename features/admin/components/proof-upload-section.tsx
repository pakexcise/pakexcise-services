"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FileUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  confirmCompletionProofUploadAction,
  requestCompletionProofUploadAction,
} from "@/features/applications/actions";
import {
  formatFileSize,
  validateClientUpload,
} from "@/features/applications/lib/validate-upload";
import { DEFAULT_ACCEPTED_MIME_TYPES, DEFAULT_MAX_FILE_SIZE_BYTES } from "@/config/uploads";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";

type ProofUploadSectionProps = {
  applicationId: string;
  existingProof?: {
    id: string;
    fileName: string;
    fileSize: number;
    status: string;
  } | null;
  labels: {
    title: string;
    description: string;
    upload: string;
    uploading: string;
    uploaded: string;
    required: string;
    uploadFailed: string;
    invalidType: string;
    tooLarge: string;
    invalidName: string;
  };
};

async function computeSha256Checksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function ProofUploadSection({
  applicationId,
  existingProof,
  labels,
}: ProofUploadSectionProps) {
  const router = useRouter();
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
      acceptedMimeTypes: [...DEFAULT_ACCEPTED_MIME_TYPES],
      maxSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
      invalidTypeMessage: labels.invalidType,
      tooLargeMessage: labels.tooLarge,
      invalidNameMessage: labels.invalidName,
    });

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const resolvedMimeType = resolveClientFileMimeType(file, [
      ...DEFAULT_ACCEPTED_MIME_TYPES,
    ]);

    if (!resolvedMimeType) {
      setError(labels.invalidType);
      return;
    }

    setError(null);

    startTransition(async () => {
      const requestResult = await requestCompletionProofUploadAction({
        applicationId,
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

        const confirmResult = await confirmCompletionProofUploadAction({
          applicationId,
          documentId: requestResult.data.documentId,
          checksum,
        });

        if (!confirmResult.success) {
          setError(confirmResult.error ?? labels.uploadFailed);
          return;
        }

        router.refresh();
      } catch {
        setError(labels.uploadFailed);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-semibold">{labels.title}</h3>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {existingProof ? (
        <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">
          <p className="font-medium">{labels.uploaded}</p>
          <p className="text-muted-foreground">
            {existingProof.fileName} ({formatFileSize(existingProof.fileSize)}) ·{" "}
            {existingProof.status}
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {labels.required}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={DEFAULT_ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleFileChange}
      />

      <Button
        type="button"
        size="sm"
        variant={existingProof ? "outline" : "default"}
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

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
