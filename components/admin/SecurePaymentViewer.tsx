"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type SecurePaymentViewerProps = {
  paymentId: string;
  labels: {
    loading: string;
    error: string;
    retry: string;
    openNewTab: string;
    unsupported: string;
  };
};

type ScreenshotPayload = {
  signedUrl: string;
  expiresInSeconds: number;
  mimeType?: string;
  fileName?: string;
};

export function SecurePaymentViewer({
  paymentId,
  labels,
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {labels.loading}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4" />
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

  const isImage = payload.mimeType?.startsWith("image/");

  return (
    <div className="space-y-3">
      <Button asChild size="sm" variant="outline">
        <a href={payload.signedUrl} target="_blank" rel="noopener noreferrer">
          {labels.openNewTab}
        </a>
      </Button>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={payload.signedUrl}
          alt={payload.fileName ?? "Payment screenshot"}
          className="max-h-[60vh] w-full rounded-lg border object-contain"
        />
      ) : (
        <p className="text-sm text-muted-foreground">{labels.unsupported}</p>
      )}
    </div>
  );
}
