import type { ApplicationStatus, NotificationEventType } from "@prisma/client";

import type { NotificationLocale } from "@/features/notifications/types";

export type TemplateContentInput = {
  eventType: NotificationEventType;
  locale: NotificationLocale;
  trackingId: string;
  serviceName: string;
  invoiceNumber?: string;
  total?: string;
  toStatus?: ApplicationStatus;
  note?: string;
  reason?: string;
};

export type TemplateContent = {
  subject: string;
  title: string;
  body: string;
  ctaLabel: string;
  whatsappText: string;
  smsText: string;
};

function formatStatus(status: ApplicationStatus, locale: NotificationLocale): string {
  const labels: Record<ApplicationStatus, { en: string }> = {
    DRAFT: { en: "draft" },
    SUBMITTED: { en: "submitted" },
    REVIEW: { en: "under review" },
    DOCS_REQUIRED: { en: "documents required" },
    INVOICE_SENT: { en: "invoice sent" },
    PAYMENT_UPLOADED: { en: "payment uploaded" },
    PAYMENT_VERIFIED: { en: "payment verified" },
    IN_PROGRESS: { en: "in progress" },
    AT_OFFICE: { en: "at office" },
    COMPLETED: { en: "completed" },
    REJECTED: { en: "rejected" },
    CANCELLED: { en: "cancelled" },
  };

  void locale;
  return labels[status].en;
}

function serviceLabel(input: TemplateContentInput): string {
  return input.serviceName;
}

export function buildNotificationContent(
  input: TemplateContentInput,
): TemplateContent {
  const service = serviceLabel(input);
  const tracking = input.trackingId;

  return buildEnglishContent(input, service, tracking);
}

function buildEnglishContent(
  input: TemplateContentInput,
  service: string,
  tracking: string,
): TemplateContent {
  const disclaimer =
    "PakExcise.com is a private facilitation service. Not affiliated with any government body.";

  switch (input.eventType) {
    case "APPLICATION_SUBMITTED":
      return {
        subject: `Application submitted — ${tracking}`,
        title: "Application submitted",
        body: `Your PakExcise application ${tracking} for ${service} has been submitted. We will review it shortly.\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Your application ${tracking} for ${service} has been submitted. Track it in your dashboard.`,
        smsText: `PakExcise: Application ${tracking} submitted. Log in to your dashboard for updates.`,
      };
    case "DOCS_REQUIRED":
      return {
        subject: `Documents required — ${tracking}`,
        title: "Additional documents required",
        body: `Your application ${tracking} for ${service} needs additional documents.${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "Upload documents",
        whatsappText: `PakExcise: Documents required for application ${tracking}. Please upload from your dashboard.`,
        smsText: `PakExcise: Documents required for ${tracking}. Check your dashboard.`,
      };
    case "INVOICE_SENT":
      return {
        subject: `Invoice ready — ${tracking}`,
        title: "Invoice sent",
        body: `Your invoice${input.invoiceNumber ? ` ${input.invoiceNumber}` : ""} for application ${tracking} is ready.${input.total ? ` Total due: ${input.total}.` : ""} Review it in your dashboard and upload payment proof.\n\n${disclaimer}`,
        ctaLabel: "View invoice",
        whatsappText: `PakExcise: Invoice ready for application ${tracking}.${input.total ? ` Amount: ${input.total}.` : ""} Open your dashboard to pay.`,
        smsText: `PakExcise: Invoice ready for ${tracking}. View details in your dashboard.`,
      };
    case "PAYMENT_UPLOADED":
      return {
        subject: `Payment proof received — ${tracking}`,
        title: "Payment screenshot uploaded",
        body: `We received your payment proof for application ${tracking}. Our team will verify it shortly.\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Payment proof received for ${tracking}. Verification in progress.`,
        smsText: `PakExcise: Payment proof received for ${tracking}.`,
      };
    case "PAYMENT_VERIFIED":
      return {
        subject: `Payment verified — ${tracking}`,
        title: "Payment verified",
        body: `Your payment for application ${tracking} has been verified. We are processing your request.${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Payment verified for ${tracking}. Processing continues.`,
        smsText: `PakExcise: Payment verified for ${tracking}.`,
      };
    case "APPLICATION_COMPLETED":
      return {
        subject: `Application completed — ${tracking}`,
        title: "Application completed",
        body: `Your application ${tracking} for ${service} is complete.${input.note ? ` ${input.note}` : ""} Download any proof from your dashboard.\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Application ${tracking} completed. Check your dashboard for proof.`,
        smsText: `PakExcise: Application ${tracking} completed.`,
      };
    case "APPLICATION_REJECTED":
      return {
        subject: `Application rejected — ${tracking}`,
        title: "Application rejected",
        body: `Your application ${tracking} for ${service} was rejected.${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Application ${tracking} was rejected. See your dashboard for details.`,
        smsText: `PakExcise: Application ${tracking} rejected.`,
      };
    case "APPLICATION_CANCELLED":
      return {
        subject: `Application cancelled — ${tracking}`,
        title: "Application cancelled",
        body: `Your application ${tracking} for ${service} was cancelled.${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Application ${tracking} cancelled.`,
        smsText: `PakExcise: Application ${tracking} cancelled.`,
      };
    case "PAYMENT_REJECTED":
      return {
        subject: `Payment proof rejected — ${tracking}`,
        title: "Payment screenshot rejected",
        body: `Your payment proof for application ${tracking} was rejected.${input.reason ? ` Reason: ${input.reason}.` : ""} Please upload a new screenshot from your dashboard.\n\n${disclaimer}`,
        ctaLabel: "Upload payment proof",
        whatsappText: `PakExcise: Payment proof rejected for ${tracking}.${input.reason ? ` Reason: ${input.reason}.` : ""} Re-upload from dashboard.`,
        smsText: `PakExcise: Payment proof rejected for ${tracking}. Re-upload required.`,
      };
    case "REVIEW_APPROVED":
      return {
        subject: `Your review was published — ${tracking}`,
        title: "Review published",
        body: `Thank you. Your feedback for ${service} (application ${tracking}) is now published on PakExcise.\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Your review for ${tracking} is now published. Thank you.`,
        smsText: `PakExcise: Review for ${tracking} published. Thank you.`,
      };
    case "REVIEW_REJECTED":
      return {
        subject: `Review not published — ${tracking}`,
        title: "Review not published",
        body: `Your feedback for ${service} (application ${tracking}) was not published.${input.reason ? ` Reason: ${input.reason}.` : ""}\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Your review for ${tracking} was not published.${input.reason ? ` Reason: ${input.reason}.` : ""}`,
        smsText: `PakExcise: Review for ${tracking} not published.`,
      };
    case "STATUS_CHANGED":
    default: {
      const statusLabel = input.toStatus
        ? formatStatus(input.toStatus, "en")
        : "updated";
      return {
        subject: `Status update — ${tracking}`,
        title: `Application ${statusLabel}`,
        body: `Your application ${tracking} for ${service} is now ${statusLabel}.${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "View application",
        whatsappText: `PakExcise: Application ${tracking} is now ${statusLabel}.`,
        smsText: `PakExcise: ${tracking} status: ${statusLabel}.`,
      };
    }
  }
}
