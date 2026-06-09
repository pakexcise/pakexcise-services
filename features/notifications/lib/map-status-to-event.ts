import type { ApplicationStatus, NotificationEventType } from "@prisma/client";

export function mapStatusToNotificationEvent(
  status: ApplicationStatus,
): NotificationEventType | null {
  switch (status) {
    case "DOCS_REQUIRED":
      return "DOCS_REQUIRED";
    case "INVOICE_SENT":
      return "INVOICE_SENT";
    case "PAYMENT_UPLOADED":
      return "PAYMENT_UPLOADED";
    case "PAYMENT_VERIFIED":
      return "PAYMENT_VERIFIED";
    case "COMPLETED":
      return "APPLICATION_COMPLETED";
    case "REJECTED":
      return "APPLICATION_REJECTED";
    case "CANCELLED":
      return "APPLICATION_CANCELLED";
    case "IN_PROGRESS":
    case "AT_OFFICE":
    case "REVIEW":
      return "STATUS_CHANGED";
    default:
      return null;
  }
}

export function shouldSkipStatusNotification(
  status: ApplicationStatus,
  hasDedicatedHandler: boolean,
): boolean {
  if (hasDedicatedHandler && status === "INVOICE_SENT") {
    return true;
  }

  return false;
}
