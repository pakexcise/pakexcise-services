import type { InvoiceLocale } from "@/features/invoices/lib/invoice-labels";

type InvoiceLineItemInput = {
  label: string;
  description: string | null;
  amount: { toString(): string };
  isOfficialFee: boolean;
};

type InvoicePaymentMethodInput = {
  paymentMethodId: string | null;
};

type InvoiceEditorInput = {
  id: string;
  invoiceNumber: string;
  locale: string;
  notes: string | null;
  officialFeeNote: string | null;
  paymentInstructions: string | null;
  taxTotal: { toString(): string };
  dueAt: Date | null;
  lineItems: InvoiceLineItemInput[];
  paymentMethods: InvoicePaymentMethodInput[];
};

export type InvoiceEditorInitialInvoice = {
  id: string;
  invoiceNumber: string;
  locale: InvoiceLocale;
  notes: string | null;
  officialFeeNote: string | null;
  paymentInstructions: string | null;
  taxTotal: number;
  dueAt: string | null;
  lineItems: Array<{
    label: string;
    description: string | null;
    amount: number;
    isOfficialFee: boolean;
  }>;
  paymentMethods: Array<{
    paymentMethodId: string | null;
  }>;
};

export function serializeInvoiceForEditor(
  invoice: InvoiceEditorInput,
): InvoiceEditorInitialInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    locale: "en",
    notes: invoice.notes,
    officialFeeNote: invoice.officialFeeNote,
    paymentInstructions: invoice.paymentInstructions,
    taxTotal: Number(invoice.taxTotal),
    dueAt: invoice.dueAt?.toISOString() ?? null,
    lineItems: invoice.lineItems.map((item) => ({
      label: item.label,
      description: item.description,
      amount: Number(item.amount),
      isOfficialFee: item.isOfficialFee,
    })),
    paymentMethods: invoice.paymentMethods.map((method) => ({
      paymentMethodId: method.paymentMethodId,
    })),
  };
}
