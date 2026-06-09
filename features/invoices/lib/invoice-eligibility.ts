import "server-only";

import type { ApplicationStatus } from "@prisma/client";

const invoiceEligibleStatuses: ApplicationStatus[] = ["REVIEW", "DOCS_REQUIRED"];

export function canCreateInvoiceForStatus(status: ApplicationStatus): boolean {
  return invoiceEligibleStatuses.includes(status);
}
