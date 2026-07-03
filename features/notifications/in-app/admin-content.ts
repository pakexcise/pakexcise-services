import "server-only";

import type { ApplicationChangeType } from "@/server/realtime/application-events";

type AdminInAppContent = {
  title: string;
  body: string;
};

export function buildAdminInAppNotificationContent(input: {
  changeType: ApplicationChangeType;
  trackingId: string;
  serviceName: string;
  status: string;
}): AdminInAppContent {
  const tracking = input.trackingId;
  const service = input.serviceName;

  switch (input.changeType) {
    case "submit":
      return {
        title: "New application submitted",
        body: `${tracking} for ${service} is waiting for admin review.`,
      };
    case "payment":
      return {
        title: "Payment proof uploaded",
        body: `${tracking} has a new payment screenshot ready for verification.`,
      };
    case "document":
      return {
        title: "Documents updated",
        body: `${tracking} has new or updated documents that may need review.`,
      };
    case "invoice":
      return {
        title: "Invoice activity",
        body: `${tracking} has invoice-related activity that may need attention.`,
      };
    case "assign":
      return {
        title: "Application assigned",
        body: `${tracking} was assigned to an agent.`,
      };
    case "status":
      return {
        title: "Application status updated",
        body: `${tracking} is now ${input.status.replaceAll("_", " ").toLowerCase()}.`,
      };
    default:
      return {
        title: "Application update",
        body: `${tracking} was updated and may need admin attention.`,
      };
  }
}

export function shouldNotifyAdminsForChangeType(
  changeType: ApplicationChangeType,
): boolean {
  return (
    changeType === "submit" ||
    changeType === "payment" ||
    changeType === "document"
  );
}
