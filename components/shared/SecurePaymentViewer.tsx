"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, FileText, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type SecurePaymentViewerProps = {
  paymentId: string;
  fileName?: string | null;
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

export function SecurePaymentViewer({
  paymentId,
  fileName,
  labels,
  className,
}: SecurePaymentViewerProps) {
  const [payload, setPayload] = useState<ScreenshotPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadScreenshot = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/screenshot-url`, {
        credentials: "include",
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
  }, [paymentId, labels.error]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadScreenshot();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadScreenshot]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {labels.loading}
        </div>
        <Skeleton className="mt-3 h-48 w-full rounded-lg" />
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

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="size-4 shrink-0" />
          <span className="truncate">{displayName}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={payload.signedUrl} target="_blank" rel="noopener noreferrer">
            {labels.openNewTab}
          </a>
        </Button>
      </div>

      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={payload.signedUrl}
          alt={displayName}
          className="max-h-[60vh] w-full rounded-lg border object-contain"
        />
      ) : null}

      {isPdf ? (
        <iframe
          src={payload.signedUrl}
          title={displayName}
          className="h-[60vh] w-full rounded-lg border bg-muted/20"
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
