import type { ApplicationStatus, PaymentStatus } from "@prisma/client";

export type CustomerNextAction =
  | "upload_docs"
  | "view_invoice"
  | "upload_payment"
  | "wait_verification"
  | "download_proof"
  | "wait_review"
  | "in_progress"
  | "none";

export function resolveCustomerNextAction(input: {
  status: ApplicationStatus;
  hasInvoice: boolean;
  paymentStatus?: PaymentStatus | null;
  hasCompletionProof: boolean;
}): CustomerNextAction {
  if (input.status === "DOCS_REQUIRED") {
    return "upload_docs";
  }

  if (input.status === "INVOICE_SENT") {
    if (
      input.paymentStatus === "PENDING" ||
      input.paymentStatus === "REJECTED"
    ) {
      return "upload_payment";
    }

    if (input.hasInvoice) {
      return "view_invoice";
    }

    return "wait_review";
  }

  if (input.status === "PAYMENT_UPLOADED") {
    return "wait_verification";
  }

  if (input.status === "COMPLETED") {
    return input.hasCompletionProof ? "download_proof" : "in_progress";
  }

  if (
    input.status === "PAYMENT_VERIFIED" ||
    input.status === "IN_PROGRESS" ||
    input.status === "AT_OFFICE"
  ) {
    return "in_progress";
  }

  if (input.status === "SUBMITTED" || input.status === "REVIEW") {
    return "wait_review";
  }

  return "none";
}

export function getCustomerNextActionLabelKey(
  action: CustomerNextAction,
): string {
  return `customer.nextAction.${action}`;
}
