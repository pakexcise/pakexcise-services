import type { PaymentMethodType } from "@prisma/client";

import { normalizeOptionalInvoiceNote } from "@/features/invoices/lib/normalize-optional-invoice-note";
import { resolveInvoicePaymentMethodQrDataUri } from "@/features/invoices/lib/resolve-invoice-payment-method-qr";
import type { CustomerInvoiceDetail } from "@/server/repositories/invoice-repository";

export type CustomerInvoicePaymentMethodView = {
  id: string;
  code: string;
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
  qrCodeUrl: string | null;
};

export type CustomerInvoiceViewData = {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  currency: string;
  notes: string | null;
  officialFeeNote: string | null;
  paymentMethod: string | null;
  paymentInstructions: string | null;
  paymentMethods: CustomerInvoicePaymentMethodView[];
  sentAt: string | null;
  dueAt: string | null;
  lineItems: Array<{
    id: string;
    label: string;
    description: string | null;
    amount: string;
    isOfficialFee: boolean;
  }>;
};

export async function serializeCustomerInvoiceForView(
  invoice: CustomerInvoiceDetail,
): Promise<CustomerInvoiceViewData> {
  const paymentMethods = await Promise.all(
    invoice.paymentMethods.map(async (method) => {
      const qrCodeUrl = await resolveInvoicePaymentMethodQrDataUri({
        qrCodeR2Key: method.qrCodeR2Key,
        qrCodeMimeType: method.qrCodeMimeType,
        paymentMethodId: method.paymentMethodId,
      });

      return {
        id: method.id,
        code: method.code,
        type: method.type,
        nameEn: method.nameEn,
        nameUr: method.nameUr,
        accountTitleEn: method.accountTitleEn,
        accountTitleUr: method.accountTitleUr,
        accountNumber: method.accountNumber,
        iban: method.iban,
        bankNameEn: method.bankNameEn,
        bankNameUr: method.bankNameUr,
        instructionsEn: method.instructionsEn,
        instructionsUr: method.instructionsUr,
        qrCodeUrl,
      };
    }),
  );

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    subtotal: invoice.subtotal.toString(),
    taxTotal: invoice.taxTotal.toString(),
    total: invoice.total.toString(),
    currency: invoice.currency,
    notes: normalizeOptionalInvoiceNote(invoice.notes),
    officialFeeNote: normalizeOptionalInvoiceNote(invoice.officialFeeNote),
    paymentMethod: invoice.paymentMethod,
    paymentInstructions: normalizeOptionalInvoiceNote(invoice.paymentInstructions),
    paymentMethods,
    sentAt: invoice.sentAt?.toISOString() ?? null,
    dueAt: invoice.dueAt?.toISOString() ?? null,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      amount: item.amount.toString(),
      isOfficialFee: item.isOfficialFee,
    })),
  };
}
