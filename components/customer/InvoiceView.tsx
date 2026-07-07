"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { pushAnalyticsEvent } from "@/features/analytics/data-layer";
import { recordClientActivity } from "@/features/tracking/lib/record-client-activity";
import { AlertTriangle, Download, FileText, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoicePaymentMethodsDisplay } from "@/components/shared/InvoicePaymentMethodsDisplay";
import { InvoiceBrandMark } from "@/components/shared/InvoiceBrandMark";
import { formatPkr } from "@/features/invoices/lib/format-pkr";

import type { CustomerInvoiceViewData } from "@/features/invoices/lib/serialize-customer-invoice";

type InvoiceViewProps = {
  applicationId: string;
  invoice: CustomerInvoiceViewData;
  locale: "en" | "ur";
  labels: {
    title: string;
    invoiceNumber: string;
    total: string;
    subtotal: string;
    tax: string;
    officialFeeNote: string;
    paymentMethods: string;
    paymentInstructions: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    bankName: string;
    instructions: string;
    scanQr: string;
    dueDate: string;
    notes: string;
    lineItems: string;
    description: string;
    amount: string;
    officialFee: string;
    downloadPdf: string;
    loadingPdf: string;
    pdfError: string;
    retry: string;
    sentOn: string;
    exactPaymentTitle: string;
    exactPaymentNotice: string;
    disclaimer: string;
  };
};

export function InvoiceView({
  applicationId,
  invoice,
  locale,
  labels,
}: InvoiceViewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) {
      return;
    }

    viewedRef.current = true;
    pushAnalyticsEvent("invoice_viewed", {
      application_id: applicationId,
      invoice_id: invoice.id,
    });
    recordClientActivity({
      event: "payment_started",
      metadata: {
        application_id: applicationId,
        invoice_id: invoice.id,
      },
    });
  }, [applicationId, invoice.id]);

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
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-primary px-5 py-4 text-primary-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <InvoiceBrandMark />
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{labels.title}</h2>
            <Badge
              variant="outline"
              className="border-white/30 bg-white/10 text-primary-foreground"
            >
              {invoice.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.invoiceNumber}
            </p>
            <p className="mt-1 font-semibold">{invoice.invoiceNumber}</p>
            {invoice.sentAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {labels.sentOn}: {dateFormatter.format(new Date(invoice.sentAt))}
              </p>
            ) : null}
            {invoice.dueAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {labels.dueDate}: {dateFormatter.format(new Date(invoice.dueAt))}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.total}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatPkr(invoice.total, locale)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">{labels.subtotal}</p>
                <p className="font-medium">{formatPkr(invoice.subtotal, locale)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{labels.tax}</p>
                <p className="font-medium">{formatPkr(invoice.taxTotal, locale)}</p>
              </div>
            </div>
          </div>
        </div>

        {invoice.lineItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">{labels.lineItems}</p>
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-[1fr_auto] gap-3 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                <span>{labels.description}</span>
                <span>{labels.amount}</span>
              </div>
              <ul className="divide-y">
                {invoice.lineItems.map((item, index) => (
                  <li
                    key={item.id}
                    className={`grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm ${
                      index % 2 === 1 ? "bg-muted/20" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.description ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                      {item.isOfficialFee ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          ({labels.officialFee})
                        </p>
                      ) : null}
                    </div>
                    <p className="font-semibold">{formatPkr(item.amount, locale)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-4 text-sm dark:border-amber-700/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                {labels.exactPaymentTitle}
              </p>
              <p className="mt-1 text-amber-800 dark:text-amber-200/90">
                {labels.exactPaymentNotice}
              </p>
            </div>
          </div>
        </div>

        {invoice.paymentMethods.length > 0 ? (
          <InvoicePaymentMethodsDisplay
            methods={invoice.paymentMethods}
            locale={locale}
            labels={{
              title: labels.paymentMethods,
              accountTitle: labels.accountTitle,
              accountNumber: labels.accountNumber,
              iban: labels.iban,
              bankName: labels.bankName,
              instructions: labels.instructions,
              scanQr: labels.scanQr,
            }}
          />
        ) : invoice.paymentMethod ? (
          <div className="text-sm">
            <p className="font-medium">{labels.paymentMethods}</p>
            <p className="text-muted-foreground">{invoice.paymentMethod}</p>
          </div>
        ) : null}

        {invoice.paymentInstructions ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-medium">{labels.paymentInstructions}</p>
            <p className="mt-1 whitespace-pre-line text-muted-foreground">
              {invoice.paymentInstructions}
            </p>
          </div>
        ) : null}

        {invoice.officialFeeNote ? (
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <p className="font-medium">{labels.officialFeeNote}</p>
            <p className="mt-1 text-muted-foreground">{invoice.officialFeeNote}</p>
          </div>
        ) : null}

        {invoice.notes ? (
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            <span className="font-medium text-foreground">{labels.notes}: </span>
            {invoice.notes}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t pt-4">
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

        <p className="border-t pt-4 text-center text-xs leading-relaxed text-muted-foreground">
          {labels.disclaimer}
        </p>
      </div>
    </div>
  );
}
