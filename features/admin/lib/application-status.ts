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

/** Translation key under the `admin.statuses` namespace (e.g. tStatus("SUBMITTED")). */
export function getApplicationStatusLabelKey(
  status: ApplicationStatus,
): string {
  return status;
}

/** Translation key under the `admin` namespace (e.g. t("statuses.SUBMITTED")). */
export function getAdminApplicationStatusLabelKey(
  status: ApplicationStatus,
): string {
  return `statuses.${status}`;
}
