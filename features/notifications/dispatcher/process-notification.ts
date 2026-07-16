import "server-only";

import type { Notification } from "@prisma/client";

import { buildNotificationTemplate } from "@/features/notifications/lib/build-template";
import { shouldSendNotificationEmail } from "@/features/notifications/lib/email-delivery-policy";
import { normalizeNotificationLocale } from "@/features/notifications/lib/resolve-locale";
import { resolveNotificationRecipient } from "@/features/notifications/lib/resolve-recipient";
import { sendEmailNotification } from "@/features/notifications/dispatcher/channels/email-channel";
import { sendSmsNotification } from "@/features/notifications/dispatcher/channels/sms-channel";
import { sendWhatsAppNotification } from "@/features/notifications/dispatcher/channels/whatsapp-channel";
import type { NotificationPayload } from "@/features/notifications/types";
import { getFeatureFlagSettings } from "@/features/settings/lib/public-settings-cache";
import { prisma } from "@/server/db/client";

export type ProcessNotificationResult =
  | { ok: true }
  | { ok: false; error: string; retryable: boolean };

function parsePayload(notification: Notification): NotificationPayload | null {
  if (!notification.payloadJson || typeof notification.payloadJson !== "object") {
    return null;
  }

  return notification.payloadJson as NotificationPayload;
}

export async function processNotificationRecord(
  notification: Notification,
): Promise<ProcessNotificationResult> {
  if (notification.channel === "IN_APP") {
    return { ok: true };
  }

  if (!notification.applicationId) {
    return { ok: false, error: "missing_application_id", retryable: false };
  }

  const payload = parsePayload(notification);

  if (!payload?.trackingId) {
    return { ok: false, error: "invalid_payload", retryable: false };
  }

  const locale = normalizeNotificationLocale(notification.locale);
  const featureFlags = await getFeatureFlagSettings();

  if (
    notification.channel === "EMAIL" &&
    !shouldSendNotificationEmail(notification.eventType, featureFlags)
  ) {
    return { ok: true };
  }

  const template = await buildNotificationTemplate({
    eventType: notification.eventType,
    locale,
    applicationId: notification.applicationId,
    payload,
  });

  const recipient = await resolveNotificationRecipient({
    userId: notification.userId,
    applicationId: notification.applicationId,
    channel: notification.channel,
  });

  if (!recipient) {
    return { ok: false, error: "recipient_not_found", retryable: false };
  }

  if (notification.channel === "EMAIL") {
    const result = await sendEmailNotification({
      to: recipient,
      subject: template.subject,
      text: template.emailText,
      html: template.html,
    });

    if (!result.ok) {
      return { ok: false, error: result.error, retryable: true };
    }

    return { ok: true };
  }

  if (notification.channel === "WHATSAPP") {
    if (!featureFlags.whatsappNotificationsEnabled) {
      return {
        ok: false,
        error: "whatsapp_notifications_disabled",
        retryable: false,
      };
    }

    const result = await sendWhatsAppNotification({
      phone: recipient,
      text: `${template.whatsappText}\n${template.applicationUrl}`,
    });

    if (result.ok) {
      return { ok: true };
    }

    if (result.fallbackToSms && featureFlags.smsFallbackEnabled) {
      const sms = await sendSmsNotification({
        phone: recipient,
        text: template.smsText,
      });

      if (sms.ok) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            lastError: `whatsapp_failed:${result.error}; sms_fallback:sent`,
          },
        });
        return { ok: true };
      }

      return {
        ok: false,
        error: `whatsapp:${result.error}; sms:${sms.error}`,
        retryable: true,
      };
    }

    return { ok: false, error: result.error, retryable: true };
  }

  if (notification.channel === "SMS") {
    if (!featureFlags.smsFallbackEnabled) {
      return { ok: false, error: "sms_notifications_disabled", retryable: false };
    }

    const result = await sendSmsNotification({
      phone: recipient,
      text: template.smsText,
    });

    if (!result.ok) {
      return { ok: false, error: result.error, retryable: true };
    }

    return { ok: true };
  }

  return { ok: false, error: "unsupported_channel", retryable: false };
}
