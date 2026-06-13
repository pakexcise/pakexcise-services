import type { InvoiceLocale } from "@/features/invoices/lib/invoice-labels";
import { invoicePdfLabels } from "@/features/invoices/lib/invoice-labels";

type StoredLineItem = {
  label: string;
  description: string | null;
  amount: { toString(): string } | number | string;
  isOfficialFee: boolean;
};

export function splitInvoiceLineItemsForEdit(
  lineItems: StoredLineItem[],
  locale: InvoiceLocale,
): {
  serviceFee: number;
  additionalLineItems: Array<{
    label: string;
    description?: string;
    amount: number;
    isOfficialFee: boolean;
  }>;
} {
  const serviceFeeLabel = invoicePdfLabels[locale].serviceFee;
  const serviceFeeIndex = lineItems.findIndex(
    (item) => item.label === serviceFeeLabel,
  );
  const resolvedIndex = serviceFeeIndex >= 0 ? serviceFeeIndex : 0;
  const serviceFeeItem = lineItems[resolvedIndex];

  const additionalLineItems = lineItems
    .filter((_, index) => index !== resolvedIndex)
    .map((item) => ({
      label: item.label,
      description: item.description ?? undefined,
      amount: Number(item.amount),
      isOfficialFee: item.isOfficialFee,
    }));

  return {
    serviceFee: serviceFeeItem ? Number(serviceFeeItem.amount) : 0,
    additionalLineItems,
  };
}
