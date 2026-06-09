"use client";

import { useCallback, useState } from "react";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPkr } from "@/features/invoices/lib/format-pkr";

type InvoiceLineItem = {
  id: string;
  label: string;
  description: string | null;
  amount: { toString(): string };
  isOfficialFee: boolean;
};

type InvoiceViewProps = {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    subtotal: { toString(): string };
    taxTotal: { toString(): string };
    total: { toString(): string };
    currency: string;
    notes: string | null;
    officialFeeNote: string | null;
    paymentMethod: string | null;
    paymentInstructions: string | null;
    sentAt: Date | string | null;
    dueAt: Date | string | null;
    lineItems: InvoiceLineItem[];
  };
  locale: "en" | "ur";
  labels: {
    title: string;
    invoiceNumber: string;
    total: string;
    subtotal: string;
    tax: string;
    officialFeeNote: string;
    paymentMethod: string;
    paymentInstructions: string;
    dueDate: string;
    notes: string;
    lineItems: string;
    officialFee: string;
    downloadPdf: string;
    loadingPdf: string;
    pdfError: string;
    retry: string;
    sentOn: string;
  };
};

export function InvoiceView({ invoice, locale, labels }: InvoiceViewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const loadPdfUrl = useCallback(async () => {
    setIsLoadingPdf(true);
    setPdfError(null);

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf-url`, {
        credentials: "include",
      });
      const data = (await response.json()) as {
        signedUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.signedUrl) {
        setPdfError(data.error ?? labels.pdfError);
        setPdfUrl(null);
        return;
      }

      setPdfUrl(data.signedUrl);
    } catch {
      setPdfError(labels.pdfError);
      setPdfUrl(null);
    } finally {
      setIsLoadingPdf(false);
    }
  }, [invoice.id, labels.pdfError]);

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "ur" ? "ur-PK" : "en-PK",
    { dateStyle: "medium" },
  );

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{labels.title}</h2>
          <p className="text-sm text-muted-foreground">
            {labels.invoiceNumber}: {invoice.invoiceNumber}
          </p>
          {invoice.sentAt ? (
            <p className="text-xs text-muted-foreground">
              {labels.sentOn}: {dateFormatter.format(new Date(invoice.sentAt))}
            </p>
          ) : null}
        </div>
        <Badge variant="outline">{invoice.status}</Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{labels.subtotal}</dt>
          <dd className="font-medium">
            {formatPkr(invoice.subtotal.toString(), locale)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{labels.tax}</dt>
          <dd className="font-medium">
            {formatPkr(invoice.taxTotal.toString(), locale)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">{labels.total}</dt>
          <dd className="text-lg font-semibold text-primary">
            {formatPkr(invoice.total.toString(), locale)}
          </dd>
        </div>
      </dl>

      {invoice.officialFeeNote ? (
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-medium">{labels.officialFeeNote}</p>
          <p className="mt-1 text-muted-foreground">{invoice.officialFeeNote}</p>
        </div>
      ) : null}

      {invoice.lineItems.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{labels.lineItems}</p>
          <ul className="space-y-2 text-sm">
            {invoice.lineItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <span>
                  {item.label}
                  {item.isOfficialFee ? (
                    <span className="ms-2 text-xs text-muted-foreground">
                      ({labels.officialFee})
                    </span>
                  ) : null}
                </span>
                <span className="font-medium">
                  {formatPkr(item.amount.toString(), locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {invoice.paymentMethod ? (
        <div className="text-sm">
          <p className="font-medium">{labels.paymentMethod}</p>
          <p className="text-muted-foreground">{invoice.paymentMethod}</p>
        </div>
      ) : null}

      {invoice.paymentInstructions ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-medium">{labels.paymentInstructions}</p>
          <p className="mt-1 whitespace-pre-line text-muted-foreground">
            {invoice.paymentInstructions}
          </p>
        </div>
      ) : null}

      {invoice.dueAt ? (
        <p className="text-sm">
          <span className="font-medium">{labels.dueDate}: </span>
          {dateFormatter.format(new Date(invoice.dueAt))}
        </p>
      ) : null}

      {invoice.notes ? (
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          <span className="font-medium text-foreground">{labels.notes}: </span>
          {invoice.notes}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isLoadingPdf ? (
          <Button type="button" variant="outline" disabled>
            <Loader2 className="size-4 animate-spin" />
            {labels.loadingPdf}
          </Button>
        ) : pdfUrl ? (
          <>
            <Button asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="size-4" />
                {labels.downloadPdf}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="size-4" />
                PDF
              </a>
            </Button>
          </>
        ) : (
          <Button type="button" onClick={() => void loadPdfUrl()}>
            <Download className="size-4" />
            {labels.downloadPdf}
          </Button>
        )}
        {pdfError ? (
          <Button type="button" variant="outline" onClick={() => void loadPdfUrl()}>
            <RefreshCw className="size-4" />
            {labels.retry}
          </Button>
        ) : null}
      </div>

      {pdfError ? (
        <p className="text-sm text-destructive" role="alert">
          {pdfError}
        </p>
      ) : null}
    </div>
  );
}
