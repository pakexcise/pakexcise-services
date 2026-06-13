import type { ApplicationStatus, PaymentStatus } from "@prisma/client";

import type { CurrentUser } from "@/server/auth/current-user";

export type PaymentProofUiStatus = "pending" | "uploaded" | "verified" | "rejected";

const applicationVerifiedStatuses: readonly ApplicationStatus[] = [
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
];

const uploadAllowedApplicationStatuses: readonly ApplicationStatus[] = [
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
];

export function resolvePaymentProofUiStatus(
  paymentStatus: PaymentStatus | string,
  applicationStatus: ApplicationStatus | string,
): PaymentProofUiStatus {
  if (paymentStatus === "REJECTED") {
    return "rejected";
  }

  if (
    paymentStatus === "VERIFIED" ||
    applicationVerifiedStatuses.includes(applicationStatus as ApplicationStatus)
  ) {
    return "verified";
  }

  if (
    paymentStatus === "UPLOADED" ||
    applicationStatus === "PAYMENT_UPLOADED"
  ) {
    return "uploaded";
  }

  return "pending";
}

export function canReplacePaymentProof(
  applicationStatus: ApplicationStatus | string,
  paymentStatus: PaymentStatus | string,
): boolean {
  if (
    !uploadAllowedApplicationStatuses.includes(
      applicationStatus as ApplicationStatus,
    )
  ) {
    return false;
  }

  if (applicationStatus === "INVOICE_SENT") {
    return paymentStatus === "PENDING" || paymentStatus === "REJECTED";
  }

  if (applicationStatus === "PAYMENT_UPLOADED") {
    return (
      paymentStatus === "UPLOADED" ||
      paymentStatus === "PENDING" ||
      paymentStatus === "REJECTED"
    );
  }

  if (applicationStatus === "PAYMENT_VERIFIED") {
    return (
      paymentStatus === "VERIFIED" ||
      paymentStatus === "UPLOADED" ||
      paymentStatus === "PENDING"
    );
  }

  return false;
}

export function canConfirmPaymentProofUpload(
  applicationStatus: ApplicationStatus | string,
): boolean {
  return uploadAllowedApplicationStatuses.includes(
    applicationStatus as ApplicationStatus,
  );
}

export function paymentProofStatusHistoryNote(
  user: CurrentUser,
  input: {
    applicationStatus: ApplicationStatus;
    isReplacement: boolean;
  },
): string {
  if (input.isReplacement) {
    return user.role === "AGENT"
      ? "Agent replaced payment screenshot on behalf of customer"
      : "Customer replaced payment screenshot";
  }

  return user.role === "AGENT"
    ? "Agent uploaded payment screenshot on behalf of customer"
    : "Customer uploaded payment screenshot";
}

export function getPaymentProofConfirmTransition(
  applicationStatus: ApplicationStatus,
): {
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  isReplacement: boolean;
} {
  if (applicationStatus === "INVOICE_SENT") {
    return {
      fromStatus: "INVOICE_SENT",
      toStatus: "PAYMENT_UPLOADED",
      isReplacement: false,
    };
  }

  if (applicationStatus === "PAYMENT_UPLOADED") {
    return {
      fromStatus: "PAYMENT_UPLOADED",
      toStatus: "PAYMENT_UPLOADED",
      isReplacement: true,
    };
  }

  if (applicationStatus === "PAYMENT_VERIFIED") {
    return {
      fromStatus: "PAYMENT_VERIFIED",
      toStatus: "PAYMENT_UPLOADED",
      isReplacement: true,
    };
  }

  throw new Error(`Unsupported application status for payment confirm: ${applicationStatus}`);
}
