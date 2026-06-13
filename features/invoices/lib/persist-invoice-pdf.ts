import "server-only";

import type { PaymentMethodType } from "@prisma/client";

import { buildInvoicePdfKey } from "@/config/uploads";
import type { InvoiceLocale } from "@/features/invoices/lib/invoice-labels";
import { renderInvoicePdfBuffer } from "@/features/invoices/lib/render-invoice-pdf";
import { putR2Object } from "@/server/r2/put-object";

type PersistInvoicePdfInput = {
  applicationId: string;
  invoiceId: string;
  locale: InvoiceLocale;
  invoiceNumber: string;
  trackingId: string;
  serviceName: string;
  customerName: string;
  issueDate: string;
  dueDate: string | null;
  lineItems: Array<{
    label: string;
    description: string | null;
    amount: number;
    isOfficialFee: boolean;
  }>;
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentMethods: Array<{
    type: PaymentMethodType;
    nameEn: string;
    nameUr: string;
    accountTitleEn: string | null;
    accountTitleUr: string | null;
    accountNumber: string | null;
    iban: string | null;
    bankNameEn: string | null;
    bankNameUr: string | null;
    instructionsEn: string | null;
    instructionsUr: string | null;
    qrCodeR2Key?: string | null;
    qrCodeMimeType?: string | null;
  }>;
  paymentInstructions: string | null;
  officialFeeNote: string | null;
  notes: string | null;
};

export async function persistInvoicePdf(
  input: PersistInvoicePdfInput,
): Promise<string> {
  const pdfBuffer = await renderInvoicePdfBuffer({
    locale: input.locale,
    invoiceNumber: input.invoiceNumber,
    trackingId: input.trackingId,
    serviceName: input.serviceName,
    customerName: input.customerName,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    lineItems: input.lineItems,
    subtotal: input.subtotal,
    taxTotal: input.taxTotal,
    total: input.total,
    paymentMethods: input.paymentMethods,
    paymentInstructions: input.paymentInstructions,
    officialFeeNote: input.officialFeeNote,
    notes: input.notes,
  });

  const pdfR2Key = buildInvoicePdfKey({
    trackingId: input.trackingId,
    invoiceId: input.invoiceId,
  });

  await putR2Object({
    key: pdfR2Key,
    body: pdfBuffer,
    contentType: "application/pdf",
  });

  return pdfR2Key;
}
