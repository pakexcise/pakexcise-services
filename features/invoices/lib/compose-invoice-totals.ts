import "server-only";

import type { InvoiceLocale } from "@/features/invoices/lib/invoice-labels";
import { invoicePdfLabels } from "@/features/invoices/lib/invoice-labels";
import { roundMoney } from "@/features/invoices/lib/format-pkr";
import type { invoiceLineItemInputSchema } from "@/features/invoices/validators";
import type { z } from "zod";

export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemInputSchema>;

export type ComposedInvoiceTotals = {
  allLineItems: Array<{
    label: string;
    description: string | null;
    amount: number;
    isOfficialFee: boolean;
  }>;
  subtotal: number;
  taxTotal: number;
  total: number;
};

export function composeInvoiceTotals(input: {
  locale: InvoiceLocale;
  serviceFee: number;
  lineItems: InvoiceLineItemInput[];
  taxTotal: number;
}): ComposedInvoiceTotals {
  const serviceFeeLabel = invoicePdfLabels[input.locale].serviceFee;

  const allLineItems = [
    {
      label: serviceFeeLabel,
      description: null as string | null,
      amount: input.serviceFee,
      isOfficialFee: false,
    },
    ...input.lineItems.map((item) => ({
      label: item.label,
      description: item.description ?? null,
      amount: item.amount,
      isOfficialFee: item.isOfficialFee,
    })),
  ];

  const subtotal = roundMoney(
    allLineItems.reduce((sum, item) => sum + item.amount, 0),
  );
  const taxTotal = roundMoney(input.taxTotal);
  const total = roundMoney(subtotal + taxTotal);

  return { allLineItems, subtotal, taxTotal, total };
}
