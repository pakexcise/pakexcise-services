import "server-only";

import type { NotificationEventType } from "@prisma/client";
import { render } from "@react-email/render";

import { ApplicationEventEmail } from "@/features/notifications/templates/emails/application-event-email";
import { getEmailBranding } from "@/features/notifications/lib/email-branding";
import {
  buildNotificationContent,
  type TemplateContentInput} from "@/features/notifications/templates/content";
import { buildSignedCustomerLinks } from "@/features/notifications/lib/build-links";
import { sanitizeNotificationText } from "@/features/notifications/lib/sanitize";
import type { NotificationLocale, NotificationPayload } from "@/features/notifications/types";

export type BuiltNotificationTemplate = {
  title: string;
  body: string;
  emailText: string;
  subject: string;
  html: string;
  whatsappText: string;
  smsText: string;
  applicationUrl: string;
};

export async function buildNotificationTemplate(input: {
  eventType: NotificationEventType;
  locale: NotificationLocale;
  applicationId: string;
  payload: NotificationPayload;
}): Promise<BuiltNotificationTemplate> {
  const links = buildSignedCustomerLinks(input.locale, input.applicationId);

  const contentInput: TemplateContentInput = {
    eventType: input.eventType,
    locale: input.locale,
    trackingId: input.payload.trackingId,
    serviceName: input.payload.serviceName,
    invoiceNumber: input.payload.invoiceNumber,
    total: input.payload.total,
    toStatus: input.payload.toStatus,
    note: input.payload.note ? sanitizeNotificationText(input.payload.note) : undefined,
    reason: input.payload.reason
      ? sanitizeNotificationText(input.payload.reason)
      : undefined};

  const content = buildNotificationContent(contentInput);
  const branding = await getEmailBranding();

  const html = await render(
    ApplicationEventEmail({
      title: content.title,
      body: content.body,
      ctaLabel: content.ctaLabel,
      ctaUrl: links.applicationUrl,
      locale: input.locale,
      branding}),
  );

  return {
    title: content.title,
    body: content.body,
    emailText: `${content.body}\n\n${branding.disclaimer}`,
    subject: content.subject,
    html,
    whatsappText: content.whatsappText,
    smsText: content.smsText,
    applicationUrl: links.applicationUrl};
}
