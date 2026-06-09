"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDocumentSignedUrlAction } from "@/features/documents/actions";

type ProofDownloadProps = {
  documentId: string;
  fileName: string;
  labels: {
    title: string;
    description: string;
    download: string;
    loading: string;
    error: string;
    retry: string;
  };
};

export function ProofDownload({
  documentId,
  fileName,
  labels,
}: ProofDownloadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    setError(null);

    startTransition(async () => {
      const result = await getDocumentSignedUrlAction({
        documentId,
        purpose: "proof",
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      window.open(result.data.signedUrl, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-primary">{labels.title}</h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
        <p className="text-xs text-muted-foreground">{fileName}</p>
      </div>
      <Button type="button" onClick={handleDownload} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {isPending ? labels.loading : labels.download}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}{" "}
          <button
            type="button"
            className="underline"
            onClick={handleDownload}
            disabled={isPending}
          >
            {labels.retry}
          </button>
        </p>
      ) : null}
    </div>
  );
}
