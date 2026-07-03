"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, FileText, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FILE_PREVIEW_FRAME_CLASS,
  FILE_PREVIEW_IMAGE_CLASS,
  FILE_PREVIEW_PDF_CLASS,
  FilePreviewFrame,
} from "@/components/shared/file-preview-frame";

type SecureCommissionProofViewerProps = {
  commissionId: string;
  fileName?: string | null;
  contentVersion?: string | null;
  labels: {
    loading: string;
    error: string;
    retry: string;
    openNewTab: string;
    unsupported: string;
  };
};

type ProofPayload = {
  signedUrl: string;
  expiresInSeconds: number;
  mimeType?: string | null;
  fileName?: string | null;
};

export function SecureCommissionProofViewer({
  commissionId,
  fileName,
  contentVersion,
  labels,
}: SecureCommissionProofViewerProps) {
  const [payload, setPayload] = useState<ProofPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveRefreshKey = contentVersion ?? fileName ?? "initial";

  const loadProof = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/commissions/${commissionId}/proof`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await response.json()) as ProofPayload & { error?: string };

      if (!response.ok) {
        setError(data.error ?? labels.error);
        setPayload(null);
        return;
      }

      setPayload(data);
    } catch {
      setError(labels.error);
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  }, [commissionId, labels.error, effectiveRefreshKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProof();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProof]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <p className="text-xs text-muted-foreground">{labels.loading}</p>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error ?? labels.error}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => void loadProof()}
        >
          <RefreshCw className="size-4" />
          {labels.retry}
        </Button>
      </div>
    );
  }

  const mimeType = payload.mimeType ?? "";
  const resolvedName = payload.fileName ?? fileName ?? "commission-proof";
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const previewInstanceKey = `${commissionId}:${effectiveRefreshKey}:${resolvedName}`;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      {isImage ? (
        <FilePreviewFrame>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={previewInstanceKey}
            src={payload.signedUrl}
            alt={resolvedName}
            className={FILE_PREVIEW_IMAGE_CLASS}
          />
        </FilePreviewFrame>
      ) : isPdf ? (
        <iframe
          key={previewInstanceKey}
          src={payload.signedUrl}
          title={resolvedName}
          className={FILE_PREVIEW_PDF_CLASS}
        />
      ) : (
        <div className="flex items-center gap-2 rounded-md border bg-background p-4 text-sm">
          <FileText className="size-5 text-muted-foreground" />
          <span>{labels.unsupported}</span>
        </div>
      )}
      <Button type="button" variant="outline" size="sm" asChild>
        <a href={payload.signedUrl} target="_blank" rel="noopener noreferrer">
          {labels.openNewTab}
        </a>
      </Button>
    </div>
  );
}
