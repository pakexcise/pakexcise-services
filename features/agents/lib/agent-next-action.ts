import type { ApplicationStatus } from "@prisma/client";

export type AgentNextAction =
  | "wait_review"
  | "customer_upload_docs"
  | "customer_payment"
  | "wait_payment_verification"
  | "in_progress"
  | "view_commission"
  | "completed"
  | "closed"
  | "none";

export function resolveAgentNextAction(input: {
  status: ApplicationStatus;
  hasCommission: boolean;
}): AgentNextAction {
  if (input.status === "DOCS_REQUIRED") {
    return "customer_upload_docs";
  }

  if (input.status === "INVOICE_SENT") {
    return "customer_payment";
  }

  if (input.status === "PAYMENT_UPLOADED") {
    return "wait_payment_verification";
  }

  if (input.status === "COMPLETED") {
    return input.hasCommission ? "view_commission" : "completed";
  }

  if (input.status === "REJECTED" || input.status === "CANCELLED") {
    return "closed";
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

export function getAgentNextActionLabelKey(action: AgentNextAction): string {
  return `agent.nextAction.${action}`;
}
