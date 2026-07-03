"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FileUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SecurePaymentViewer } from "@/components/shared/SecurePaymentViewer";
import { pushAnalyticsEvent } from "@/features/analytics/data-layer";
import {
  confirmPaymentScreenshotUploadAction,
  requestPaymentScreenshotUploadAction,
} from "@/features/payments/actions";
import {
  canReplacePaymentProof,
  resolvePaymentProofUiStatus,
} from "@/features/payments/lib/payment-proof-state";
import { broadcastApplicationUpdate } from "@/features/realtime/broadcast-application-update";
import {
  formatFileSize,
  validateClientUpload,
} from "@/features/applications/lib/validate-upload";
import { resolveClientFileMimeType } from "@/lib/utils/resolve-file-mime";

type PaymentUploadProps = {
  applicationId: string;
  applicationStatus: string;
  paymentId: string;
  paymentStatus: string;
  screenshotFileName?: string | null;
  rejectionReason?: string | null;
  maxSizeBytes: number;
  acceptedMimeTypes: string[];
  labels: {
    title: string;
    description: string;
    upload: string;
    uploading: string;
    uploaded: string;
    replace: string;
    replaceHint?: string;
    maxSize: string;
    allowedTypes: string;
    uploadFailed: string;
    invalidType: string;
    tooLarge: string;
    invalidName: string;
    waitingVerification: string;
    verified: string;
    rejected: string;
    rejectionReason: string;
    viewer: {
      loading: string;
      error: string;
      retry: string;
      openNewTab: string;
      unsupported: string;
    };
  };
  onUploaded?: () => void;
};

async function computeSha256Checksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function PaymentUpload({
  applicationId,
  applicationStatus,
  paymentId,
  paymentStatus,
  screenshotFileName,
  rejectionReason,
  maxSizeBytes,
  acceptedMimeTypes,
  labels,
  onUploaded,
}: PaymentUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [localFileNameOverride, setLocalFileNameOverride] = useState<string | null>(
    null,
  );
  const [uploadPreviewRevision, setUploadPreviewRevision] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fileName = localFileNameOverride ?? screenshotFileName ?? null;
  const previewRefreshKey = `${screenshotFileName ?? ""}:${uploadPreviewRevision}`;

  const uiStatus = resolvePaymentProofUiStatus(paymentStatus, applicationStatus);
  const canUpload = canReplacePaymentProof(applicationStatus, paymentStatus);
  const showPreview =
    uiStatus === "uploaded" ||
    uiStatus === "verified" ||
    Boolean(fileName);
  const showUploadForm = uiStatus === "pending" || uiStatus === "rejected" || canUpload;

  function handlePickFile() {
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !canUpload) {
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
      const presign = await requestPaymentScreenshotUploadAction({
        paymentId,
        fileName: file.name,
        mimeType: resolvedMimeType,
        fileSize: file.size,
      });

      if (!presign.success) {
        setError(presign.error ?? labels.uploadFailed);
        return;
      }

      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file, file.name);

        const uploadResponse = await fetch(
          `/api/payments/${presign.data.paymentId}/upload`,
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
        const confirm = await confirmPaymentScreenshotUploadAction({
          paymentId: presign.data.paymentId,
          checksum,
        });

        if (!confirm.success) {
          setError(confirm.error ?? labels.uploadFailed);
          return;
        }

        setError(null);
        pushAnalyticsEvent("payment_uploaded", {
          application_id: applicationId,
          payment_id: paymentId,
        });

        setLocalFileNameOverride(file.name);
        setUploadPreviewRevision((current) => current + 1);
        onUploaded?.();
        broadcastApplicationUpdate();
        router.refresh();
      } catch {
        setError(labels.uploadFailed);
      }
    });
  }

  return (
    <div
      className={
        uiStatus === "verified"
          ? "space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5"
          : "space-y-4 rounded-xl border p-5"
      }
    >
      {showUploadForm && (uiStatus === "pending" || uiStatus === "rejected") ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{labels.title}</h2>
          <p className="text-sm text-muted-foreground">{labels.description}</p>
        </div>
      ) : null}

      {uiStatus === "verified" ? (
        <p className="font-medium text-primary">{labels.verified}</p>
      ) : null}

      {uiStatus === "uploaded" ? (
        <p className="font-medium">{labels.waitingVerification}</p>
      ) : null}

      {uiStatus === "rejected" && rejectionReason ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">{labels.rejected}</p>
          <p className="mt-1">
            {labels.rejectionReason}: {rejectionReason}
          </p>
        </div>
      ) : null}

      {showPreview ? (
        <SecurePaymentViewer
          paymentId={paymentId}
          fileName={fileName}
          refreshKey={previewRefreshKey}
          labels={labels.viewer}
        />
      ) : null}

      {canUpload ? (
        <>
          {uiStatus === "verified" && labels.replaceHint ? (
            <p className="text-sm text-muted-foreground">{labels.replaceHint}</p>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptedMimeTypes.join(",")}
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant={uiStatus === "verified" ? "outline" : "default"}
              onClick={handlePickFile}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileUp className="size-4" />
              )}
              {isPending
                ? labels.uploading
                : fileName
                  ? labels.replace
                  : labels.upload}
            </Button>
            {fileName ? (
              <Badge variant="secondary">{fileName}</Badge>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            {labels.maxSize}: {formatFileSize(maxSizeBytes)} · {labels.allowedTypes}:{" "}
            {acceptedMimeTypes.join(", ")}
          </p>
        </>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
