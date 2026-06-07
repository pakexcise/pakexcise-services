import type { ApplicationStatus } from "@prisma/client";

export const applicationStatusOrder: ApplicationStatus[] = [
  "SUBMITTED",
  "REVIEW",
  "DOCS_REQUIRED",
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

export function getApplicationStatusLabelKey(
  status: ApplicationStatus,
): string {
  return `statuses.${status}`;
}
