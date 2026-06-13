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
import { subscribeToApplicationUpdates } from "@/features/realtime/broadcast-application-update";

type SecurePaymentViewerProps = {
  paymentId: string;
  fileName?: string | null;
  /** Changes when the stored screenshot changes (e.g. updatedAt timestamp). */
  contentVersion?: string | null;
  /** Bumps when the underlying screenshot changes so preview refetches immediately. */
  refreshKey?: string | number | null;
  /** Refetch preview when other tabs upload/replace payment proof. */
  syncLive?: boolean;
  labels: {
    loading: string;
    error: string;
    retry: string;
    openNewTab: string;
    unsupported: string;
  };
  className?: string;
};

type ScreenshotPayload = {
  signedUrl: string;
  expiresInSeconds: number;
  mimeType?: string | null;
  fileName?: string | null;
};

function withPreviewCacheBuster(
  signedUrl: string,
  refreshKey: string | number | null | undefined,
): string {
  if (refreshKey == null) {
    return signedUrl;
  }

  try {
    const url = new URL(
      signedUrl,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );

    if (url.pathname.endsWith("/content")) {
      url.searchParams.set("v", String(refreshKey));
      return url.toString();
    }
  } catch {
    return signedUrl;
  }

  return signedUrl;
}

export function SecurePaymentViewer({
  paymentId,
  fileName,
  contentVersion,
  refreshKey,
  syncLive = false,
  labels,
  className,
}: SecurePaymentViewerProps) {
  const [payload, setPayload] = useState<ScreenshotPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncRevision, setSyncRevision] = useState(0);

  const baseRefreshKey = refreshKey ?? contentVersion ?? fileName ?? "initial";
  const effectiveRefreshKey = syncLive
    ? `${baseRefreshKey}:${syncRevision}`
    : baseRefreshKey;

  const loadScreenshot = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/screenshot-url`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await response.json()) as ScreenshotPayload & { error?: string };

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
  }, [paymentId, labels.error, effectiveRefreshKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadScreenshot();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadScreenshot]);

  useEffect(() => {
    if (!syncLive) {
      return;
    }

    return subscribeToApplicationUpdates(() => {
      setSyncRevision((current) => current + 1);
    });
  }, [syncLive]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {labels.loading}
        </div>
        <Skeleton className="mt-3 h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div
        className={`rounded-lg border border-destructive/30 bg-destructive/5 p-4 ${className ?? ""}`}
      >
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{error ?? labels.error}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => void loadScreenshot()}
        >
          <RefreshCw className="size-4" />
          {labels.retry}
        </Button>
      </div>
    );
  }

  const displayName = fileName ?? payload.fileName ?? "Payment screenshot";
  const mimeType = payload.mimeType ?? "image/jpeg";
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const previewSrc = withPreviewCacheBuster(payload.signedUrl, effectiveRefreshKey);
  const previewInstanceKey = `${paymentId}:${effectiveRefreshKey}:${displayName}`;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="size-4 shrink-0" />
          <span className="truncate">{displayName}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={previewSrc} target="_blank" rel="noopener noreferrer">
            {labels.openNewTab}
          </a>
        </Button>
      </div>

      {isImage ? (
        <FilePreviewFrame>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={previewInstanceKey}
            src={previewSrc}
            alt={displayName}
            className={FILE_PREVIEW_IMAGE_CLASS}
          />
        </FilePreviewFrame>
      ) : null}

      {isPdf ? (
        <iframe
          key={previewInstanceKey}
          src={previewSrc}
          title={displayName}
          className={FILE_PREVIEW_PDF_CLASS}
        />
      ) : null}

      {!isImage && !isPdf ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {labels.unsupported}
        </p>
      ) : null}
    </div>
  );
}
