import "server-only";

import { canViewInvoicePdf } from "@/features/invoices/lib/invoice-access";
import { readPaymentMethodQrContent } from "@/features/payment-methods/lib/payment-method-qr-content";
import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";

export async function handleInvoicePaymentMethodQrContent(
  user: CurrentUser,
  invoiceId: string,
  methodId: string,
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      status: true,
      application: {
        select: {
          userId: true,
          agentId: true,
        },
      },
      paymentMethods: {
        where: { id: methodId },
        select: {
          id: true,
          code: true,
          qrCodeR2Key: true,
          qrCodeMimeType: true,
        },
        take: 1,
      },
    },
  });

  if (!invoice || invoice.status !== "SENT") {
    return { status: 404, error: "Invoice not found" } as const;
  }

  if (!canViewInvoicePdf(user, invoice.application)) {
    return { status: 403, error: "Access denied" } as const;
  }

  const method = invoice.paymentMethods[0];

  if (!method) {
    return { status: 404, error: "Payment method not found" } as const;
  }

  return readPaymentMethodQrContent({
    qrCodeR2Key: method.qrCodeR2Key,
    qrCodeMimeType: method.qrCodeMimeType,
    fileName: `${method.code}-qr.png`,
  });
}
