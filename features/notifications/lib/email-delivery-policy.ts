import type { NotificationEventType } from "@prisma/client";

import type { FeatureFlagSettings } from "@/features/settings/types";

export function shouldSendNotificationEmail(
  eventType: NotificationEventType,
  settings: FeatureFlagSettings,
): boolean {
  if (!settings.emailNotificationsEnabled) {
    return false;
  }

  switch (eventType) {
    case "APPLICATION_SUBMITTED":
      return settings.applicationSubmissionEmailsEnabled;
    case "INVOICE_SENT":
    case "PAYMENT_UPLOADED":
    case "PAYMENT_VERIFIED":
    case "PAYMENT_REJECTED":
      return settings.invoicePaymentEmailsEnabled;
    case "REVIEW_APPROVED":
    case "REVIEW_REJECTED":
      return settings.reviewDecisionEmailsEnabled;
    case "STATUS_CHANGED":
    case "DOCS_REQUIRED":
    case "APPLICATION_COMPLETED":
    case "APPLICATION_REJECTED":
    case "APPLICATION_CANCELLED":
      return settings.applicationStatusEmailsEnabled;
  }

  return false;
}
