import type { InvoiceStatus, PaymentStatus } from "@prisma/client";

export function canEditSentInvoice(input: {
  invoiceStatus: InvoiceStatus;
  paymentStatus?: PaymentStatus | null;
}): boolean {
  if (input.invoiceStatus !== "SENT") {
    return false;
  }

  if (!input.paymentStatus) {
    return true;
  }

  return input.paymentStatus === "PENDING" || input.paymentStatus === "REJECTED";
}

export function getInvoiceEditBlockReason(input: {
  invoiceStatus: InvoiceStatus;
  paymentStatus?: PaymentStatus | null;
}): "not_sent" | "payment_uploaded" | "payment_verified" | null {
  if (input.invoiceStatus !== "SENT") {
    return "not_sent";
  }

  if (input.paymentStatus === "UPLOADED") {
    return "payment_uploaded";
  }

  if (input.paymentStatus === "VERIFIED") {
    return "payment_verified";
  }

  return null;
}
