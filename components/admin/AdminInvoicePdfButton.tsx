"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminInvoicePdfButtonProps = {
  invoiceId: string;
  label: string;
  loadingLabel: string;
  errorLabel: string;
};

export function AdminInvoicePdfButton({
  invoiceId,
  label,
  loadingLabel,
  errorLabel,
}: AdminInvoicePdfButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenPdf() {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}/pdf-url`, {
          credentials: "include",
        });
        const data = (await response.json()) as {
          signedUrl?: string;
          error?: string;
        };

        if (!response.ok || !data.signedUrl) {
          setError(data.error ?? errorLabel);
          return;
        }

        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } catch {
        setError(errorLabel);
      }
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleOpenPdf}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {isPending ? loadingLabel : label}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
