"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, FileText, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type SecureDocViewerProps = {
  documentId: string;
  purpose?: "view" | "proof";
  fileName?: string;
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

export function SecureDocViewer({
  documentId,
  purpose = "view",
  fileName,
  labels,
  className,
}: SecureDocViewerProps) {
  const [payload, setPayload] = useState<SignedUrlPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const loadSignedUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/documents/${documentId}/signed-url?purpose=${purpose}`,
        { method: "GET", credentials: "include" },
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
  }, [documentId, purpose, labels.error]);

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
            <a href={payload.signedUrl} target="_blank" rel="noopener noreferrer">
              {labels.openNewTab}
            </a>
          </Button>
        </div>
      </div>

      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed URL is short-lived and not optimizable
        <img
          src={payload.signedUrl}
          alt={displayName}
          className="max-h-[70vh] w-full rounded-lg border object-contain"
        />
      ) : null}

      {isPdf ? (
        <iframe
          src={payload.signedUrl}
          title={displayName}
          className="h-[70vh] w-full rounded-lg border bg-muted/20"
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
