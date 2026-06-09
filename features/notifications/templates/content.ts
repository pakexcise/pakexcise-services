import type { ApplicationStatus, NotificationEventType } from "@prisma/client";

import type { NotificationLocale } from "@/features/notifications/types";

export type TemplateContentInput = {
  eventType: NotificationEventType;
  locale: NotificationLocale;
  trackingId: string;
  serviceName: string;
  serviceNameUr?: string;
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
  const labels: Record<ApplicationStatus, { en: string; ur: string }> = {
    DRAFT: { en: "draft", ur: "مسودہ" },
    SUBMITTED: { en: "submitted", ur: "جمع" },
    REVIEW: { en: "under review", ur: "جائزے میں" },
    DOCS_REQUIRED: { en: "documents required", ur: "دستاویزات درکار" },
    INVOICE_SENT: { en: "invoice sent", ur: "انوائس بھیجی گئی" },
    PAYMENT_UPLOADED: { en: "payment uploaded", ur: "ادائیگی اپ لوڈ" },
    PAYMENT_VERIFIED: { en: "payment verified", ur: "ادائیگی تصدیق شدہ" },
    IN_PROGRESS: { en: "in progress", ur: "جاری" },
    AT_OFFICE: { en: "at office", ur: "دفتر میں" },
    COMPLETED: { en: "completed", ur: "مکمل" },
    REJECTED: { en: "rejected", ur: "مسترد" },
    CANCELLED: { en: "cancelled", ur: "منسوخ" },
  };

  const entry = labels[status];
  return locale === "ur" ? entry.ur : entry.en;
}

function serviceLabel(input: TemplateContentInput): string {
  if (input.locale === "ur" && input.serviceNameUr?.trim()) {
    return input.serviceNameUr;
  }

  return input.serviceName;
}

export function buildNotificationContent(
  input: TemplateContentInput,
): TemplateContent {
  const service = serviceLabel(input);
  const tracking = input.trackingId;

  if (input.locale === "ur") {
    return buildUrduContent(input, service, tracking);
  }

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

function buildUrduContent(
  input: TemplateContentInput,
  service: string,
  tracking: string,
): TemplateContent {
  const disclaimer =
    "PakExcise.com ایک نجی سہولت سروس ہے۔ کسی سرکاری ادارے سے وابستہ نہیں۔";

  switch (input.eventType) {
    case "APPLICATION_SUBMITTED":
      return {
        subject: `درخواست جمع — ${tracking}`,
        title: "درخواست جمع ہو گئی",
        body: `آپ کی PakExcise درخواست ${tracking} (${service}) جمع ہو گئی ہے۔ ہم جلد جائزہ لیں گے۔\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: آپ کی درخواست ${tracking} (${service}) جمع ہو گئی۔`,
        smsText: `PakExcise: درخواست ${tracking} جمع۔`,
      };
    case "DOCS_REQUIRED":
      return {
        subject: `دستاویزات درکار — ${tracking}`,
        title: "اضافی دستاویزات درکار",
        body: `درخواست ${tracking} (${service}) کے لیے مزید دستاویزات درکار ہیں۔${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "دستاویزات اپ لوڈ کریں",
        whatsappText: `PakExcise: درخواست ${tracking} کے لیے دستاویزات درکار۔`,
        smsText: `PakExcise: ${tracking} — دستاویزات درکار۔`,
      };
    case "INVOICE_SENT":
      return {
        subject: `انوائس تیار — ${tracking}`,
        title: "انوائس بھیج دی گئی",
        body: `درخواست ${tracking} کی انوائس${input.invoiceNumber ? ` ${input.invoiceNumber}` : ""} تیار ہے۔${input.total ? ` کل رقم: ${input.total}۔` : ""} ڈیش بورڈ سے دیکھیں اور ادائیگی کی تصویر اپ لوڈ کریں۔\n\n${disclaimer}`,
        ctaLabel: "انوائس دیکھیں",
        whatsappText: `PakExcise: درخواست ${tracking} کی انوائس تیار۔${input.total ? ` رقم: ${input.total}` : ""}`,
        smsText: `PakExcise: ${tracking} انوائس تیار۔`,
      };
    case "PAYMENT_UPLOADED":
      return {
        subject: `ادائیگی کی تصویر موصول — ${tracking}`,
        title: "ادائیگی کی تصویر اپ لوڈ",
        body: `درخواست ${tracking} کی ادائیگی کی تصویر موصول ہوئی۔ تصدیق جاری ہے۔\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: ${tracking} ادائیگی کی تصویر موصول۔`,
        smsText: `PakExcise: ${tracking} ادائیگی موصول۔`,
      };
    case "PAYMENT_VERIFIED":
      return {
        subject: `ادائیگی تصدیق — ${tracking}`,
        title: "ادائیگی تصدیق شدہ",
        body: `درخواست ${tracking} کی ادائیگی تصدیق ہو گئی۔${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: ${tracking} ادائیگی تصدیق۔`,
        smsText: `PakExcise: ${tracking} ادائیگی تصدیق۔`,
      };
    case "APPLICATION_COMPLETED":
      return {
        subject: `درخواست مکمل — ${tracking}`,
        title: "درخواست مکمل",
        body: `درخواست ${tracking} (${service}) مکمل ہو گئی۔${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: درخواست ${tracking} مکمل۔`,
        smsText: `PakExcise: ${tracking} مکمل۔`,
      };
    case "APPLICATION_REJECTED":
      return {
        subject: `درخواست مسترد — ${tracking}`,
        title: "درخواست مسترد",
        body: `درخواست ${tracking} (${service}) مسترد ہو گئی۔${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: درخواست ${tracking} مسترد۔`,
        smsText: `PakExcise: ${tracking} مسترد۔`,
      };
    case "APPLICATION_CANCELLED":
      return {
        subject: `درخواست منسوخ — ${tracking}`,
        title: "درخواست منسوخ",
        body: `درخواست ${tracking} (${service}) منسوخ ہو گئی۔${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: درخواست ${tracking} منسوخ۔`,
        smsText: `PakExcise: ${tracking} منسوخ۔`,
      };
    case "PAYMENT_REJECTED":
      return {
        subject: `ادائیگی کی تصویر مسترد — ${tracking}`,
        title: "ادائیگی کی تصویر مسترد",
        body: `درخواست ${tracking} کی ادائیگی کی تصویر مسترد ہوئی۔${input.reason ? ` وجہ: ${input.reason}۔` : ""} نئی تصویر ڈیش بورڈ سے اپ لوڈ کریں۔\n\n${disclaimer}`,
        ctaLabel: "ادائیگی کی تصویر اپ لوڈ کریں",
        whatsappText: `PakExcise: ${tracking} ادائیگی مسترد۔${input.reason ? ` ${input.reason}` : ""}`,
        smsText: `PakExcise: ${tracking} ادائیگی مسترد۔`,
      };
    case "STATUS_CHANGED":
    default: {
      const statusLabel = input.toStatus
        ? formatStatus(input.toStatus, "ur")
        : "اپ ڈیٹ";
      return {
        subject: `اسٹیٹس اپ ڈیٹ — ${tracking}`,
        title: `درخواست ${statusLabel}`,
        body: `درخواست ${tracking} (${service}) اب ${statusLabel} ہے۔${input.note ? ` ${input.note}` : ""}\n\n${disclaimer}`,
        ctaLabel: "درخواست دیکھیں",
        whatsappText: `PakExcise: ${tracking} — ${statusLabel}۔`,
        smsText: `PakExcise: ${tracking} — ${statusLabel}۔`,
      };
    }
  }
}
