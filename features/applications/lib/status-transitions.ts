import type { ApplicationStatus } from "@/config/app";
import { applicationStatuses } from "@/config/app";

const allowedTransitions: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  SUBMITTED: ["REVIEW", "CANCELLED"],
  REVIEW: ["DOCS_REQUIRED", "INVOICE_SENT", "REJECTED", "CANCELLED"],
  DOCS_REQUIRED: ["REVIEW", "REJECTED", "CANCELLED"],
  INVOICE_SENT: ["PAYMENT_UPLOADED", "CANCELLED"],
  PAYMENT_UPLOADED: ["PAYMENT_VERIFIED", "INVOICE_SENT"],
  PAYMENT_VERIFIED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["AT_OFFICE", "COMPLETED", "REJECTED", "CANCELLED"],
  AT_OFFICE: ["COMPLETED", "REJECTED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransitionStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (applicationStatuses as readonly string[]).includes(value);
}
