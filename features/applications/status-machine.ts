import type { ApplicationStatus } from "@prisma/client";

import type { ApplicationStatus as ConfigApplicationStatus } from "@/config/app";
import { applicationStatuses } from "@/config/app";

const adminPipelineStatuses = [
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
] as const satisfies readonly ApplicationStatus[];

export type AdminPipelineStatus = (typeof adminPipelineStatuses)[number];

const allowedTransitions: Record<
  ConfigApplicationStatus,
  readonly ConfigApplicationStatus[]
> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
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

const notificationTransitions = new Set<ApplicationStatus>([
  "DOCS_REQUIRED",
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

export function isAdminPipelineStatus(
  status: ApplicationStatus,
): status is AdminPipelineStatus {
  return (adminPipelineStatuses as readonly ApplicationStatus[]).includes(
    status,
  );
}

export function getAllowedNextStatuses(
  current: ApplicationStatus,
): ApplicationStatus[] {
  return [...(allowedTransitions[current] ?? [])];
}

export function canTransitionApplicationStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function requiresStatusNote(): true {
  return true;
}

export function shouldNotifyCustomerOnTransition(
  toStatus: ApplicationStatus,
): boolean {
  return notificationTransitions.has(toStatus);
}

export function isTerminalStatus(status: ApplicationStatus): boolean {
  return status === "COMPLETED" || status === "REJECTED" || status === "CANCELLED";
}

export function isValidApplicationStatus(
  value: string,
): value is ApplicationStatus {
  return (applicationStatuses as readonly string[]).includes(value);
}

export { adminPipelineStatuses };
