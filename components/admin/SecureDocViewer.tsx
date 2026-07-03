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
import { getPublicAppUrl } from "@/config/env.shared";

type SecureDocViewerProps = {
  documentId: string;
  purpose?: "view" | "proof";
  fileName?: string;
  contentVersion?: string | null;
  refreshKey?: string | number | null;
  syncLive?: boolean;
  labels: {
    loading: string;
    error: string;
    retry: string;
    expiresIn: string;
    unsupported: string;
    openNewTab: string;
  };
  className?: string;
};

type SignedUrlPayload = {
  signedUrl: string;
  expiresInSeconds: number;
  mimeType: string;
  fileName: string;
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
      typeof window !== "undefined" ? window.location.origin : getPublicAppUrl(),
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

export function SecureDocViewer({
  documentId,
  purpose = "view",
  fileName,
  contentVersion,
  refreshKey,
  syncLive = false,
  labels,
  className,
}: SecureDocViewerProps) {
  const [payload, setPayload] = useState<SignedUrlPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [syncRevision, setSyncRevision] = useState(0);

  const baseRefreshKey = refreshKey ?? contentVersion ?? fileName ?? "initial";
  const effectiveRefreshKey = syncLive
    ? `${baseRefreshKey}:${syncRevision}`
    : baseRefreshKey;

  const loadSignedUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/documents/${documentId}/signed-url?purpose=${purpose}`,
        { method: "GET", credentials: "include", cache: "no-store" },
      );

      const data = (await response.json()) as SignedUrlPayload & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? labels.error);
        setPayload(null);
        setExpiresAt(null);
        return;
      }

      setPayload(data);
      setExpiresAt(Date.now() + data.expiresInSeconds * 1000);
      setNow(Date.now());
    } catch {
      setError(labels.error);
      setPayload(null);
      setExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, purpose, labels.error, effectiveRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadSignedUrl();
      if (cancelled) {
        return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadSignedUrl]);

  useEffect(() => {
    if (!syncLive) {
      return;
    }

    return subscribeToApplicationUpdates(() => {
      setSyncRevision((current) => current + 1);
    });
  }, [syncLive]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const isExpired = expiresAt !== null && expiresAt <= now;
  const minutesRemaining =
    expiresAt && !isExpired
      ? Math.max(1, Math.ceil((expiresAt - now) / 60_000))
      : null;

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

  if (error || !payload || isExpired) {
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
          onClick={() => void loadSignedUrl()}
        >
          <RefreshCw className="size-4" />
          {labels.retry}
        </Button>
      </div>
    );
  }

  const displayName = fileName ?? payload.fileName;
  const isImage = payload.mimeType.startsWith("image/");
  const isPdf = payload.mimeType === "application/pdf";
  const previewSrc = withPreviewCacheBuster(payload.signedUrl, effectiveRefreshKey);
  const previewInstanceKey = `${documentId}:${effectiveRefreshKey}:${displayName}`;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="size-4" />
          <span className="truncate">{displayName}</span>
        </div>
        <div className="flex items-center gap-2">
          {minutesRemaining ? (
            <span className="text-xs text-muted-foreground">
              {labels.expiresIn.replace("__MINUTES__", String(minutesRemaining))}
            </span>
          ) : null}
          <Button asChild size="sm" variant="outline">
            <a href={previewSrc} target="_blank" rel="noopener noreferrer">
              {labels.openNewTab}
            </a>
          </Button>
        </div>
      </div>

      {isImage ? (
        <FilePreviewFrame>
          {/* eslint-disable-next-line @next/next/no-img-element -- signed URL is short-lived and not optimizable */}
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
